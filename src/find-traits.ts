import fs from 'fs';
import path from 'path';
import { readCSV, readAddresses } from './utils';
import binarySearch from 'binary-search';
import { UserProfile } from './types';

let traitsLoaded = false;

let traits: { [key: string]: bigint[] } = {};
let duneLabels: { [key: string]: string } = {};

// Load all traits into memory
// We sort the trait accounts so we can binary search through them
const loadTraits = async () => {
  const traitFiles = fs.readdirSync('./traits');

  for (const traitFileName of traitFiles) {
    const traitName = traitFileName.replace('.csv', '');

    const traitFile = path.join('./traits', traitFileName);
    const traitAccounts = await readAddresses(traitFile);

    // Sort trait accounts so we can binary search through them
    const sortedTraitAccounts = traitAccounts.sort((a, b) => (a > b ? 1 : -1));

    traits[traitName] = sortedTraitAccounts;
  }

  // Load Dune labels
  const duneLabelsJSON = await fs.readFileSync('fc-dune-labels.json', 'utf8');
  duneLabels = JSON.parse(duneLabelsJSON);

  traitsLoaded = true;
};

// Find traits that a given address satisfies
export const findTraits = async (_address: string): Promise<string[]> => {
  if (!traitsLoaded) {
    await loadTraits();
  }

  const traitsFound = [];

  const address = BigInt(_address);

  for (const trait of Object.keys(traits)) {
    const traitAccounts = traits[trait];

    // Search traits the address satisfies
    const index = binarySearch(traitAccounts, address, (element: bigint, needle: bigint) =>
      element === needle ? 0 : element > needle ? 1 : -1,
    );

    if (index >= 0) {
      traitsFound.push(trait);
    }
  }

  // Add Dune labels
  const accountDuneLabels = duneLabels[_address.toLowerCase()];
  if (accountDuneLabels) {
    traitsFound.push(...accountDuneLabels);
  }

  return traitsFound;
};

type AccountRecord = UserProfile & {
  custodyAddress: string;
  traits: string[];
};

const findTraitsAll = async () => {
  const fcAccountToTraits: AccountRecord[] = [];

  // Load all FC accounts
  const fcUsers = (await readCSV('fc-users.csv')) as UserProfile[];
  const fcCustodyAccounts = await readCSV('fc-custody-accounts.csv');

  // Find traits for each FC account by its custody address
  for (const fcUser of fcUsers) {
    const traits = [];

    // Get the custody address of the FID
    const custodyAccount = fcCustodyAccounts.find((account) => account.fid === fcUser.fid);

    if (!custodyAccount) {
      console.log(`No custody account found for FID ${fcUser.fid}`);
      continue;
    }

    const custodyAddressTraits = await findTraits(custodyAccount.address);
    traits.push(...custodyAddressTraits);

    if (fcUser.ensAddress) {
      const ensTraits = await findTraits(fcUser.ensAddress);
      traits.push(...ensTraits);
    }

    if (traits.length) {
      fcAccountToTraits.push({
        ...fcUser,
        custodyAddress: custodyAccount.address as string,
        traits,
      });
    }
  }

  fs.writeFileSync('fc-account-traits.json', JSON.stringify(fcAccountToTraits, null, 2));

  console.log("\nOutput written to 'fc-account-traits.json'");
};

findTraitsAll();
