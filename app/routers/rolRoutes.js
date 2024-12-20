import { Router } from "express";
import { RolController } from "../controllers/rolController";

const router = Router();
router.post("/create/rol", RolController.create);

export default router;
