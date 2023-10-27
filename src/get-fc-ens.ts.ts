import 'dotenv/config';
import axios from 'axios';
import { AxiosError } from 'axios';
import { createObjectCsvWriter } from 'csv-writer';
import { publicClient } from './client';
import { readCSV } from './utils';
import fs from 'fs';
import { normalize } from 'viem/ens';

// Get ENS address of a given ENS name
const getEnsAddress = async (ensName: string): Promise<string> => {
  const result = await publicClient.getEnsAddress({
    name: normalize(ensName),
  });

  return result as string;
};

type ENSUser = {
  fid: number;
  ens: string | null;
  ensAddress: string | null;
};

const HUBBLE_URL = 'http://127.0.0.01:2281/v1';

// Get ENS account of a Farcaster account if it exists
const getENS = async (fid: number): Promise<ENSUser> => {
  try {
    const { data } = await axios.get(HUBBLE_URL + '/userDataByFid', {
      params: {
        fid,
        user_data_type: 6,
      },
    });

    const username = data.data.userDataBody.value;

    if (username.includes('.eth')) {
      return {
        fid,
        ens: username,
        ensAddress: await getEnsAddress(username),
      };
    }
  } catch (err: any) {}

  return {
    fid,
    ens: null,
    ensAddress: null,
  };
};

const outFileName = 'fc-ens-accounts.csv';

// Index the ENS names of all Farcaster accounts
const getAllFcEns = async () => {
  const batchSize = 100;

  if (fs.existsSync(outFileName)) {
    console.log(`File ${outFileName} already exists`);
  } else {
    // Create the file to write to
    fs.writeFileSync(outFileName, '');

    let retries = 0;
    for (let i = 2; i < 200000; ) {
      if (retries > 0) {
        console.log(`Retrying (${retries}})`);
      }

      if (retries > 5) {
        console.log(`Skipping batch ${i} - ${i + batchSize}`);
        i += batchSize;
      }

      const timerLabel = `Batch ${i} - ${i + batchSize}`;
      console.time(timerLabel);
      const ensNames = [];
      const csvData = await readCSV(outFileName);

      let users: ENSUser[] = [];
      try {
        users = await Promise.all(
          new Array(batchSize).fill(0).map(async (_, j) => {
            return await getENS(i + j);
          }),
        );
        retries = 0;
      } catch (e) {
        retries++;
        console.log(e);
        console.timeEnd(timerLabel);
        continue;
      }

      for (const user of users) {
        if (user.ens) {
          ensNames.push(user);
        }
      }

      console.log(`Found ${ensNames.length} ENS names`);

      const updatedData = [...csvData, ...ensNames];

      const csvWriter = createObjectCsvWriter({
        path: outFileName,
        header: [
          { id: 'ens', title: 'ens' },
          { id: 'ensAddress', title: 'ensAddress' },
          { id: 'fid', title: 'fid' },
        ],
      });

      await csvWriter.writeRecords(updatedData); // returns a promise
      i += batchSize;
      console.timeEnd(timerLabel);
    }

    console.log('...Done');
  }
};

getAllFcEns();
