import { Router } from "express";
import {
  createRol,
  getRolesController,
  updateRolController,
} from "../controller/rolController.js";
import { rolesAdmin } from "../utils/role.js";
import { checkRole } from "../middleware/auth.js";

const router = Router();
router.post("/role/create", checkRole(rolesAdmin), createRol);
router.patch("/role/update/:id", checkRole(rolesAdmin), updateRolController);
//router.patch("/rol/delete/:id");
router.get("/role/get", checkRole(rolesAdmin), getRolesController);

export default router;
