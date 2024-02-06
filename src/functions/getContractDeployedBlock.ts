import { ethers } from "ethers";

interface GetBlockParams {
  contractAddress: string;
  providerUrl: string;
}

export const getContractDeployed = async () => {
  return async ({ contractAddress, providerUrl }: GetBlockParams) => {
    const provider = new ethers.JsonRpcProvider(providerUrl);

    const result = await findDeploymentBlockWithBinarySearch(
      contractAddress,
      provider
    );
    console.log(result);
  };
};

async function findDeploymentBlockWithBinarySearch(
  contractAddress: string,
  provider: ethers.Provider
) {
  let endBlock = await provider.getBlockNumber();
  let startBlock = 0;
  while (startBlock <= endBlock) {
    const middleBlock = Math.floor((startBlock + endBlock) / 2);
    const codeAtMiddleBlock = await provider.getCode(
      contractAddress,
      middleBlock
    );

    if (codeAtMiddleBlock.length > 2) {
      endBlock = middleBlock - 1;
    } else {
      startBlock = middleBlock + 1;
    }
  }

  const codeAtStartBlock = await provider.getCode(contractAddress, startBlock);

  const deploymentBlock = codeAtStartBlock.length > 2 ? startBlock : -1;

  return deploymentBlock;
}
