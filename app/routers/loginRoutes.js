import { Router } from "express";
import { validate } from "../controller/loginController.js";

const router = Router();
router.post("/login", validate);

export default router;
