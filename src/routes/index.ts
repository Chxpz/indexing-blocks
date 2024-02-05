import { Router } from "express";
import { check, getContractBlockNumber } from "../controllers/index";

const router = Router();

router.get("/check", check);
router.post("/getContractBlockNumber", getContractBlockNumber);

export default router;
