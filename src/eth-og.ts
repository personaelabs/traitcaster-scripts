import { readCSV } from './utils';

const isPresale = async (address: string): Promise<boolean> => {
  const presaleAddrs = await readCSV('data/eth-presale.csv');

  return presaleAddrs
    .map((k) => k['address'])
    .map((a) => a.toLowerCase())
    .includes(address.toLowerCase());
};

const isBeaconGenesis = async (address: string): Promise<boolean> => {
  const beaconGenesisAddrs = await readCSV('data/beacon-genesis.csv');

  return beaconGenesisAddrs
    .map((k) => k['depositor'])
    .map((a) => a.toLowerCase())
    .includes(address.toLowerCase());
};

export const getEthTraits = async (address: string): Promise<string[]> => {
  const _isPresale = await isPresale(address);
  if (_isPresale) {
    console.log(`Address ${address} is a presale address`);
  }

  const _isBeaconGenesis = await isBeaconGenesis(address);
  if (_isBeaconGenesis) {
    console.log(`Address ${address} is a beacon genesis address`);
  }

  return [];
};
