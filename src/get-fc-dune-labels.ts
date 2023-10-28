import 'dotenv/config';
import axios from 'axios';
import { readCSV } from './utils';
import fs from 'fs';

const DUNE_URL = 'https://api.dune.com/api/v1';
const DUNE_HEADERS = {
  'x-dune-api-key': process.env.DUNE_API_KEY,
};

const executeQuery = async (
  queryId: string,
  params: { [key: string]: string },
): Promise<string> => {
  const { data } = await axios.post(
    `${DUNE_URL}/query/${queryId}/execute`,
    {
      query_parameters: {
        ...params,
      },
    },
    {
      headers: DUNE_HEADERS,
    },
  );

  return data.execution_id;
};

const getQueryResult = async (executionId: string): Promise<any> => {
  const { data } = await axios.get(`${DUNE_URL}/execution/${executionId}/results`, {
    headers: DUNE_HEADERS,
  });

  return data;
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const findTraitsDune = async () => {
  const fcENSAccounts = await readCSV('fc-users.csv');

  const addresses = fcENSAccounts
    .filter((account) => account.ensAddress)
    .map((account) => account.ensAddress.toLowerCase());

  console.log('Executing Dune query...');
  const executionId = await executeQuery('3152483', {
    accounts: addresses.join(','),
  });

  console.log(`Execution ID: ${executionId}`);

  const waitFor = 15000;
  await sleep(waitFor); // Wait 15 seconds for the query to execute

  console.log('Getting query result...');
  const result = await getQueryResult(executionId);

  if (result.state !== 'QUERY_STATE_COMPLETED') {
    throw new Error(`Query didn't complete in ${waitFor}ms}`);
  }

  const queryResult = result.result.rows;

  const outFile = 'fc-nft-transfer.json';
  fs.writeFileSync(outFile, JSON.stringify(queryResult, null, 2));

  console.log(`\nOutput written to ${outFile}`);

  /*
  // Map addresses to labels
  let addressToLabels: { [key: string]: string } = {};
  for (const row of queryResult) {
    addressToLabels[row.address] = row.labels;
  }

  const outFile = 'fc-dune-labels.json';
  fs.writeFileSync(outFile, JSON.stringify(addressToLabels, null, 2));

  console.log(`\nOutput written to ${outFile}`);
  */
};

findTraitsDune();
