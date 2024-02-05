interface GetBlockParams {
  contractAddress: string;
  providerUrl: string;
}

interface FindDeploymentBlockParams {
  contractAddress: string;
  providerUrl: string;
  ethers: any;
}

export const getContractDeployed = async (ethers: any) => {
  return async ({ contractAddress, providerUrl }: GetBlockParams) => {
    const result = await findDeploymentBlock({
      contractAddress,
      providerUrl,
      ethers,
    });

    console.log(result);
  };
};

async function findDeploymentBlock({
  contractAddress,
  providerUrl,
  ethers,
}: FindDeploymentBlockParams) {
  let startBlock = 0;
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  let endBlock = await provider.getBlockNumber();

  for (let i = endBlock; i > startBlock; i--) {
    console.log("Checking block", i);
    const block = await provider.getBlockWithTransactions(i);
    const contractCreationTx = block.transactions.find(
      (tx: any) =>
        tx.to === null &&
        ethers.utils.getAddress(tx.creates) === contractAddress
    );

    if (contractCreationTx) {
      const existedInPrevBlock = await checkInPreviousBlock(
        provider,
        contractAddress,
        i - 1,
        ethers
      );

      if (!existedInPrevBlock) {
        return i;
      }
    }
  }
  return -1;
}

const checkInPreviousBlock = async (
  provider: any,
  contractAddress: string,
  blockNumber: number,
  ethers: any
) => {
  const block = await provider.getBlockWithTransactions(blockNumber);
  return block.transactions.some(
    (tx: any) =>
      tx.to === null && ethers.utils.getAddress(tx.creates) === contractAddress
  );
};
