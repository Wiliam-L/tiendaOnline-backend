import { Router } from "express";
import {
  getStateController,
  stateController,
  updateStateController,
} from "../controller/stateController.js";
import { checkRole } from "../middleware/auth.js";
import { rolesAdmin } from "../utils/role.js";

const router = Router();

router.post("/state/create", checkRole(rolesAdmin), stateController);
router.patch("/state/update/:id", checkRole(rolesAdmin), updateStateController);
router.patch("/state/delete/:id", checkRole(rolesAdmin));
router.get("/state/get", checkRole(rolesAdmin), getStateController);

export default router;
