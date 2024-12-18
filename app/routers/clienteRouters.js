import express from "express";
import { crearClienteController } from "../controller/createClienteController.js";

const router = express.Router();

router.post("/create-client", crearClienteController);

export default router;
