import fs from 'fs';
import csv from 'csv-parser';

// Read a CSV file of addresses and return an array of BigInt addresses
export const readAddresses = async (csvFilePath: string): Promise<bigint[]> => {
  return new Promise((resolve, reject) => {
    const csvData: bigint[] = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        csvData.push(BigInt(row.address));
      })
      .on('end', () => {
        resolve(csvData);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Read a CSV file and return an array of objects with the CSV headers as keys
export const readCSV = async (csvFilePath: string): Promise<{ [key: string]: string }[]> => {
  return new Promise((resolve, reject) => {
    const csvData: { [key: string]: string }[] = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        csvData.push(row);
      })
      .on('end', () => {
        resolve(csvData);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/*
readCSV('fc-ens-accounts.csv').then((accounts) => {
  console.log(accounts.map((account) => account.ensAddress));
});
*/
