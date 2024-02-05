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
  console.log("contractAddress", contractAddress);
  let startBlock = 0;
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  let endBlock = await provider.getBlockNumber();

  while (startBlock <= endBlock) {
    const midBlock = Math.floor((startBlock + endBlock) / 2);

    const block = await provider.getBlockWithTransactions(midBlock);

    const contractCreationTx = block.transactions.find(
      (tx: any) =>
        tx.to === null &&
        ethers.utils.getAddress(tx.creates) === contractAddress
    );
    if (contractCreationTx) {
      const prevBlock = await provider.getBlockWithTransactions(midBlock - 1);
      const existedInPrevBlock = prevBlock.transactions.some(
        (tx: any) =>
          tx.to === null &&
          ethers.utils.getAddress(tx.creates) === contractAddress
      );
      if (!existedInPrevBlock) {
        return midBlock;
      }
      endBlock = midBlock - 1;
    } else {
      startBlock = midBlock + 1;
    }
  }
  return -1;
}
