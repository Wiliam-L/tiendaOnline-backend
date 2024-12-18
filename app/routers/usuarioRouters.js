import express from "express";
import { createUserController } from "../controller/createUserController.js";

const router = express.Router();

router.post("/register", createUserController);
export default router;
