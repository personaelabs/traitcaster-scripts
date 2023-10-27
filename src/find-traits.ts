import fs from 'fs';
import path from 'path';
import { readCSV, readAddresses } from './utils';
import binarySearch from 'binary-search';

let traitsLoaded = false;

let traits: { [key: string]: bigint[] } = {};

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

  return traitsFound;
};

type AccountToTraits = {
  [key: number]: string[];
};

const findTraitsAll = async () => {
  const fcAccountsFile = 'fc-custody-accounts.csv';

  const fcAccountToTraits: AccountToTraits[] = [];

  // Load all FC accounts
  const fcCustodyAccounts = await readCSV(fcAccountsFile);

  console.log('Custody accounts:');
  // Find traits for each FC account by its custody address
  for (const fcCustodyAccount of fcCustodyAccounts) {
    const traits = await findTraits(fcCustodyAccount.address);
    if (traits.length) {
      console.log(`fid:${fcCustodyAccount.fid} (${fcCustodyAccount.address}): ${traits}`);

      fcAccountToTraits.push({
        [fcCustodyAccount.fid.toString()]: traits,
      });
    }
  }

  const fcAddress = 'fc-ens-accounts.csv';
  // Load all FC accounts with ENS names
  const fcENSAccounts = await readCSV(fcAddress);

  console.log('\nENS accounts:');
  // Find traits for each FC account by its ENS address
  for (const fcENSAccount of fcENSAccounts) {
    const traits = await findTraits(fcENSAccount.ensAddress);
    if (traits.length) {
      console.log(`fid:${fcENSAccount.fid} ${fcENSAccount.ens}: ${traits}`);

      fcAccountToTraits.push({
        [fcENSAccount.fid.toString()]: traits,
      });
    }
  }

  fs.writeFileSync('fc-account-traits.json', JSON.stringify(fcAccountToTraits, null, 2));

  console.log("\nOutput written to 'fc-account-traits.json'");
};

findTraitsAll();
