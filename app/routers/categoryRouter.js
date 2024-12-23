import { Router } from "express";
import { checkRole } from "../middleware/auth.js";
import {
  createCategoryController,
  getCategoryController,
  inactiveCategoryController,
  updateCategoryController,
} from "../controller/categoryProductsController.js";
import { rolesAdmin } from "../utils/role.js";
rolesAdmin;

const router = Router();

// crear categoria
router.post(
  "/category/create",
  checkRole(rolesAdmin),
  createCategoryController
);

// actualizar categoria
router.patch(
  "/category/update/:id",
  checkRole(rolesAdmin),
  updateCategoryController
);

// inactivar categoria
router.patch(
  "/category/inactive/:id",
  checkRole(rolesAdmin),
  inactiveCategoryController
);

// obtener todas las categorias
router.get("/category/get", checkRole(rolesAdmin), getCategoryController);

export default router;
