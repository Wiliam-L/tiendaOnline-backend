import sequelize from "../config/db.js";
import State from "../model/states.js";
import {
  createStateService,
  getStateService,
  updateStateService,
} from "../services/stateService.js";
import { Op } from "@sequelize/core";

//crear estado
export const stateController = async (req, res, next) => {
  const { nombre } = req.body;
  try {
    return await createStateService(nombre);
  } catch (error) {
    next(error);
  }
};

//actualizar estado
export const updateStateController = async (req, res, next) => {
  const { nombre } = req.body;
  const { id } = req.params;

  try {
    if (!id || !nombre) {
      const error = new Error("");
      error.name = "FieldsRequiredError";
      throw error;
    }

    const existingId = await State.findByPk(id);
    if (!existingId) {
      return res.status(404).json({ message: "El id no existe" });
    }

    const existingName = await State.findOne({
      where: {
        nombre: { [Op.like]: nombre },
      },
    });
    if (existingName) {
      return res.status(400).json({ message: "El estado ya existe" });
    }

    await sequelize.transaction(async (t) => {
      await updateStateService(id, nombre, { transaction: t });
    });
    return res.status(200).json({ message: "estado actualizado" });
  } catch (error) {
    next(error);
  }
};

//obtener todos los estados
export const getStateController = async (req, res, next) => {
  try {
    const result = await getStateService();
    return res.status(200).json({
      state: result,
    });
  } catch (error) {
    next(error);
  }
};
