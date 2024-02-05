import { Request, Response } from "express";
import { ethers } from "ethers";
import { getContractDeployed } from "../functions/index";

export const check = (req: Request, res: Response) => {
  res.send("Service API is ok");
};

export const getContractBlockNumber = async (req: Request, res: Response) => {
  try {
    const { contractAddress, providerUrl } = req.body;

    if (!contractAddress || !providerUrl) {
      res.status(400).send({ error: "Invalid request body" });
      return;
    }

    await (
      await getContractDeployed(ethers)
    )({ contractAddress, providerUrl });
    res.send("Ok");
  } catch (e: any) {
    res.status(500).send({ error: e.message });
  }
};
