import { Router } from "express";
import getFile from "../utils/multer.js";
import createProducts from "../controller/productsController.js";
import { checkRole } from "../utils/token.js";

const router = Router();

router.post(
  "/create/product",
  checkRole(["administrador", "gerente"]),
  getFile.single("foto"),
  createProducts
);

export default router;
