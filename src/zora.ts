import { ZDK, ZDKNetwork, ZDKChain } from '@zoralabs/zdk';

const API_ENDPOINT = 'https://api.zora.co/graphql';
const zdk = new ZDK({ endpoint: API_ENDPOINT });

// Get all NFTs for a given address from the Zora API
export const getNFTs = async (address: string): Promise<string[]> => {
  const args = {
    where: {
      ownerAddresses: [address],
    },
    includeFullDetails: false, // Optional, provides more data on the NFTs such as events
    includeSalesHistory: false, // Optional, provides sales data on the NFTs
    networks: [
      {
        network: ZDKNetwork.Zora,
        chain: ZDKChain.ZoraMainnet,
      },
      {
        network: ZDKNetwork.Ethereum,
        chain: ZDKChain.Mainnet,
      },
      {
        network: ZDKNetwork.Optimism,
        chain: ZDKChain.OptimismMainnet,
      },
      {
        network: ZDKNetwork.Base,
        chain: ZDKChain.BaseMainnet,
      },
      {
        network: ZDKNetwork.Pgn,
        chain: ZDKChain.PgnMainnet,
      },
      {
        network: ZDKNetwork.Pgn,
        chain: ZDKChain.PgnMainnet,
      },
    ],
  };

  const response = await zdk.tokens(args);

  // We only get the collection names for now.
  // If a user has > 1 tokens from a single collection,
  // the tokens will be grouped by collection, and
  // the collection name will be returned.
  const tokensNames = [
    ...new Set(
      response.tokens.nodes
        .map((node) => node.token.tokenContract?.name)
        .filter((name) => name)
        .map((name) => `nft:${name}`),
    ),
  ] as string[];

  return tokensNames;
};
