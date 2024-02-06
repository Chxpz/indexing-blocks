import { ethers } from "ethers";

interface GetBlockParams {
  contractAddress: string;
  providerUrl: string;
}

interface FindDeploymentBlockParams {
  contractAddress: string;
  providerUrl: string;
}

export const getContractDeployed = async () => {
  return async ({ contractAddress, providerUrl }: GetBlockParams) => {
    const result = await findDeploymentBlock({
      contractAddress,
      providerUrl,
    });

    console.log(result);
  };
};

async function findDeploymentBlock({
  contractAddress,
  providerUrl,
}: FindDeploymentBlockParams) {
  const provider = new ethers.JsonRpcProvider(providerUrl);
  let endBlock = await provider.getBlockNumber();
  let startBlock = 0;

  const deploymentBlock = await findMe(
    contractAddress,
    startBlock,
    endBlock,
    provider
  );

  return deploymentBlock;
}

async function findMe(
  contractAddress: string,
  startBlock: number,
  endBlock: number,
  provider: ethers.JsonRpcProvider
): Promise<string> {
  console.log("Searching");
  if (startBlock > endBlock) {
    return "Contract deployment block not found";
  }

  const midBlock = Math.floor((startBlock + endBlock) / 2);
  const block = await provider.getBlock(midBlock, true);

  if (!block) {
    return "No Block found at mid position";
  }

  let found = false;

  if (block.transactions.length > 0) {
    for (let txHash of block.transactions) {
      const r = await provider.getTransaction(txHash);

      if (!r) {
        return "No transaction found";
      }

      const receipt = await provider.getTransactionReceipt(r.hash);
      if (
        receipt &&
        receipt.contractAddress &&
        receipt.to === null &&
        ethers.getAddress(receipt.contractAddress) ===
          ethers.getAddress(contractAddress)
      ) {
        found = true;
        break;
      }
    }
  }

  if (found) {
    return `Contract deployed in block ${midBlock}`;
  } else {
    const resultFromSecondHalf: any = await findMe(
      contractAddress,
      midBlock + 1,
      endBlock,
      provider
    );
    if (resultFromSecondHalf !== "Contract deployment block not found") {
      return resultFromSecondHalf;
    }
    return findMe(contractAddress, startBlock, midBlock - 1, provider);
  }
}
