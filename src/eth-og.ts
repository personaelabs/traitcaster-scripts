import { readCSV } from './utils';

let presaleAddrs: { [key: string]: string }[] = [];

const isPresale = async (address: string): Promise<boolean> => {
  if (presaleAddrs.length === 0) {
    presaleAddrs = await readCSV('data/eth-presale.csv');
  }

  return presaleAddrs
    .map((k) => k['address'])
    .map((a) => a.toLowerCase())
    .includes(address.toLowerCase());
};

let beaconGenesisAddrs: { [key: string]: string }[] = [];

const isBeaconGenesis = async (address: string): Promise<boolean> => {
  if (beaconGenesisAddrs.length === 0) {
    beaconGenesisAddrs = await readCSV('data/beacon-genesis.csv');
  }

  return beaconGenesisAddrs
    .map((k) => k['depositor'])
    .map((a) => a.toLowerCase())
    .includes(address.toLowerCase());
};

const normAddrFromPgDune = (address: string): string => {
  const addrRE = /(\b0x[a-f0-9]{40}\b)/;

  const match = address.match(addrRE);
  if (match) {
    return match[0].toLowerCase();
  }

  return '';
};

let pgMembers: { [key: string]: string }[] = [];

const isPGMember = async (address: string): Promise<boolean> => {
  if (pgMembers.length === 0) {
    pgMembers = await readCSV('data/pg-members.csv');
  }
  return pgMembers
    .map((k) => k['member'])
    .map(normAddrFromPgDune)
    .includes(address.toLowerCase());
};

let pgDonors: { [key: string]: string }[] = [];

const isPGDonor = async (address: string): Promise<boolean> => {
  if (pgDonors.length === 0) {
    pgDonors = await readCSV('data/pg-donors.csv');
  }

  return pgDonors
    .map((k) => k['donor_address'])
    .map(normAddrFromPgDune)
    .includes(address.toLowerCase());
};

export const getEthTraits = async (address: string): Promise<string[]> => {
  let traits = [];

  const _isPresale = await isPresale(address);
  if (_isPresale) {
    console.log(`Address ${address} is a presale address`);
    traits.push('eth:presale');
  }

  const _isBeaconGenesis = await isBeaconGenesis(address);
  if (_isBeaconGenesis) {
    console.log(`Address ${address} is a beacon genesis address`);
    traits.push('eth:beacon-genesis');
  }

  const _isPGMember = await isPGMember(address);
  if (_isPGMember) {
    console.log(`Address ${address} is a PG member`);
    traits.push('eth:pg-member');
  }

  const _isPGDonor = await isPGDonor(address);
  if (_isPGDonor) {
    console.log(`Address ${address} is a PG donor`);
    traits.push('eth:pg-donor');
  }

  return traits;
};
