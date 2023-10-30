import fs from 'fs';
import { UserProfile } from './types';
import { readCSV } from './utils';
import { getNFTs } from './zora';

export const getAllNfts = async () => {
  const fcUsers = (await readCSV('fc-users.csv')) as UserProfile[];

  // Get all NFTs for FC accounts with ENS names
  const fcENSUsers = fcUsers.filter((user) => user.ensAddress);

  // FID to Name of the token
  const nftOwnerships: { [fid: string]: string[] } = {};

  for (const fcUser of fcENSUsers.slice(0, 3)) {
    const nfts = await getNFTs(fcUser.ensAddress!);
    console.log(`Found ${nfts.length} NFTs for ${fcUser.ensAddress}`);

    nftOwnerships[fcUser.fid] = nfts;
  }

  fs.writeFileSync('fc-nfts.json', JSON.stringify(nftOwnerships, null, 2));
};

getAllNfts();
