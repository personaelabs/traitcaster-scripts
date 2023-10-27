import 'dotenv/config';
import axios from 'axios';
import { publicClient } from './client';
import { normalize } from 'viem/ens';
import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import { readCSV } from './utils';
import { UserProfile } from './types';

// Get ENS address of a given ENS name
const getEnsAddress = async (ensName: string): Promise<string> => {
  const result = await publicClient.getEnsAddress({
    name: normalize(ensName),
  });

  return result as string;
};

const HUBBLE_URL = 'http://127.0.0.01:2281/v1';

const userDataTypes = [
  {
    type: 'php',
    key: 1,
  },
  {
    type: 'displayName',
    key: 2,
  },
  {
    type: 'bio',
    key: 3,
  },
  {
    type: 'username',
    key: 6,
  },
];

// Get Farcaster user profile by FID from Hubble
const getUserProfile = async (fid: number): Promise<UserProfile | null> => {
  let profile: any = {};
  try {
    for (const { key, type } of userDataTypes) {
      const { data } = await axios.get(HUBBLE_URL + '/userDataByFid', {
        params: {
          fid,
          user_data_type: key,
        },
      });

      const value = data.data.userDataBody.value;
      if (value) {
        profile[type] = value;
      }

      if (type === 'username') {
        const username = value;

        // Get the ENS name and address it the username is an ENS name
        if (username.includes('.eth')) {
          profile['ens'] = username;
          profile['ensAddress'] = await getEnsAddress(username);
        }
      }
    }
  } catch (err: any) {
    return null;
  }

  return {
    fid: fid.toString(),
    pfp: profile.php || null,
    displayName: profile.displayName || null,
    bio: profile.bio || null,
    url: profile.url || null,
    username: profile.username || null,
    ens: profile.ens || null,
    ensAddress: profile.ensAddress || null,
  };
};

const outFileName = 'fc-users.csv';

const getAllFcUsers = async () => {
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

      const timerLabel = `Batch ${i} - ${i + batchSize}`;
      console.time(timerLabel);
      const csvData = await readCSV(outFileName);

      let users: UserProfile[] = [];
      try {
        users = (
          await Promise.all(
            new Array(batchSize).fill(0).map(async (_, j) => {
              return await getUserProfile(i + j);
            }),
          )
        ).filter((user) => user !== null) as UserProfile[];
        retries = 0;
      } catch (e) {
        if (retries > 5) {
          console.log(`Skipping batch ${i} - ${i + batchSize}`);
          i += batchSize;
        } else {
          retries++;
        }

        console.log(e);
        console.timeEnd(timerLabel);
        continue;
      }

      const updatedData = [...csvData, ...users];

      const csvWriter = createObjectCsvWriter({
        path: outFileName,
        header: [
          { id: 'fid', title: 'fid' },
          { id: 'username', title: 'username' },
          { id: 'ens', title: 'ens' },
          { id: 'ensAddress', title: 'ensAddress' },
          { id: 'pfp', title: 'pfp' },
          { id: 'displayName', title: 'displayName' },
          { id: 'bio', title: 'bio' },
        ],
      });

      await csvWriter.writeRecords(updatedData); // returns a promise
      i += batchSize;
      console.timeEnd(timerLabel);
    }

    console.log('...Done');
  }
};

getAllFcUsers();
