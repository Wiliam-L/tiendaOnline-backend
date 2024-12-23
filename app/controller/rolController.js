import { Op } from "@sequelize/core";
import sequelize from "../config/db.js";
import Rol from "../model/rol.js";
import {
  createRolService,
  getRol,
  updateRolService,
} from "../services/rolService.js";

//crear rol
export const createRol = async (req, res, next) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ message: "Nombre del rol obligatorio" });
  }
  try {
    await createRolService(nombre);
    return res.status(201).json({ message: "Rol creado con éxito" });
  } catch (error) {
    next(error);
  }
};

//actualizar rol
export const updateRolController = async (req, res, next) => {
  const { nombre } = req.body;
  const { id } = req.params;

  try {
    if (!id || !nombre) {
      const error = new Error("");
      error.name = "FieldsRequiredError";
      throw error;
    }

    const existingId = await Rol.findByPk(id);
    if (!existingId) {
      return res.status(404).json({ message: "El id no existe" });
    }

    const existingName = await Rol.findOne({
      where: {
        nombre: { [Op.like]: nombre },
      },
    });
    if (existingName) {
      return res.status(400).json({ message: "El rol ya existe" });
    }

    await sequelize.transaction(async (t) => {
      await updateRolService(id, nombre, { transaction: t });
    });
    return res.status(200).json({ message: "Rol actualizado" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//obtener roles
export const getRolesController = async (req, res, next) => {
  try {
    const resultRoles = await getRol();
    return res.status(200).json({
      rol: resultRoles,
    });
  } catch (error) {
    next(error);
  }
};
