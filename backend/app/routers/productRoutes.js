import { Router } from "express";
import getFile from "../utils/multer.js";
import {
  createProductsController,
  getProductsController,
  inactiveProductController,
  updateProductController,
} from "../controller/productsController.js";
import { checkRole } from "../middleware/auth.js";
import { rolesAdmin } from "../utils/role.js";
rolesAdmin;

const router = Router();

router.post(
  "/product/create",
  checkRole(rolesAdmin),
  getFile.single("foto"),
  createProductsController
);
router.patch(
  "/product/update/:id",
  checkRole(rolesAdmin),
  getFile.single("foto"),
  updateProductController
);

router.patch(
  "/product/inactive/:id",
  checkRole(rolesAdmin),
  inactiveProductController
);

router.get("/product/get", checkRole(rolesAdmin), getProductsController);
export default router;
