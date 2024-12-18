import { Router } from "express";
import registerUser from "../controller/registerController.js";

const router = Router();

router.post("/register", registerUser);

export default router;
