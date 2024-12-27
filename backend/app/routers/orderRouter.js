import { Router } from "express";
import { checkRole } from "../middleware/auth.js";
import crearOrden from "../controller/ordenController.js";
import { rolesAdminAclient } from "../utils/role.js";

const router = Router();
router.post("/order/create", checkRole(rolesAdminAclient), crearOrden);

export default router;
