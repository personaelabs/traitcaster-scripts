import fs from 'fs';
import { readCSV } from './utils';
import { UserProfile } from './types';
import { getNFTs } from './zora';
import { getEthTraits } from './eth-og';

// Find traits that a given address satisfies
export const findTraits = async (address: string): Promise<string[]> => {
  // const traitsFound = await getNFTs(address);
  // return traitsFound;

  const traits = await getEthTraits(address);
  return traits;
};

type AccountRecord = UserProfile & {
  custodyAddress: string;
  traits: string[];
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const findTraitsAll = async () => {
  const fcAccountToTraits: AccountRecord[] = [];
  const fcCustodyAccounts = await readCSV('fc-custody-accounts.csv');
  // Load all FC accounts
  const fcUsers = (await readCSV('fc-users.csv')) as UserProfile[];

  // FC accounts with ENS names.
  // We only search traits for FC accounts with ENS names for now.
  const fcENSUsers = fcUsers.filter((user) => user.ensAddress);

  // Find traits for FC accounts with ENS names
  const batchSize = 20;
  for (let i = 0; i < fcENSUsers.length; i += batchSize) {
    const batch = fcENSUsers.slice(i, i + batchSize);

    console.time(`Batch ${i} - ${i + batchSize}`);
    await Promise.all(
      batch.map(async (fcUser) => {
        try {
          // Get the custody address of the FID
          const custodyAccount = fcCustodyAccounts.find((account) => account.fid === fcUser.fid);

          if (!custodyAccount) {
            console.log(`No custody account found for FID ${fcUser.fid}`);
            return;
          }

          // Find traits for the FC account
          const traits = await findTraits(fcUser.ensAddress!);

          fcAccountToTraits.push({
            ...fcUser,
            custodyAddress: custodyAccount.address as string,
            traits,
          });
        } catch (err) {
          console.log(`Error finding traits for ${fcUser.ens}`);
          console.error(err);
        }
      }),
    );

    console.timeEnd(`Batch ${i} - ${i + batchSize}`);

    await sleep(1000);
  }

  fs.writeFileSync('fc-account-traits.json', JSON.stringify(fcAccountToTraits, null, 2));

  console.log("\nOutput written to 'fc-account-traits.json'");
};

findTraitsAll();
