import { Router } from "express";
import {
  registerUserController,
  registerUserOperatorController,
} from "../controller/userController.js";
import { checkRole } from "../middleware/auth.js";
import {rolesAdmin} from "../utils/role.js";
import { validate } from "../controller/loginController.js";
import { getNewToken } from "../utils/token.js";
const router = Router();

//rutas públicas
router.post("/login", validate);
router.post("/auth/register", registerUserController);

//rutas privadas
router.post(
  "/auth/register/operator",
  checkRole(rolesAdmin),
  registerUserOperatorController
);
router.post("/auth/refresh-token", getNewToken);

export default router;
