import { Router } from "express";
import getFile from "../utils/multer.js";
import createProducts from "../controller/productsController.js";

const router = Router();

router.post("/create/product", getFile.single("foto"), createProducts);

export default router;
