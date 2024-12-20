import sequelize from "../config/db.js";
import errorHandler from "../middleware/errorHandle.js";
import createRolService from "../services/RolService.js";

export const createRol = async (req, res, next) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: "Nombre del rol obligatorio" });
  }
  try {
    await createRolService(nombre);
    return res.status(201).json({ message: "Rol creado con éxito" });
  } catch (error) {
    console.log(error.errors[0].value)
    next(error);
  }
};
