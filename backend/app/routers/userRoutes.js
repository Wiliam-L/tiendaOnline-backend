import { Router } from "express";
import { getUserController } from "../controller/userController.js";
import { checkRole } from "../middleware/auth.js";

const router = Router();
//rutas públicas

//rutas privadas
router.patch("/user/user/:id");
router.patch("/user/delete/:id");
router.get(
  "/user/get",
  checkRole(["administrador", "operador"]),
  getUserController
);

export default router;
