import { Router } from "express";
import { getNewToken } from "../utils/token.js";

const router = Router();
router.post("/refresh", getNewToken);

export default router;
