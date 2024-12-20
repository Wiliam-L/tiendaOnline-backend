import sequelize from "../config/db.js";
import { QueryTypes } from "@sequelize/core";

const createStateService = async (nombre) => {
  if (!nombre) {
    return res.status(400).json({ message: "Nombre del estado obligatorio" });
  }
  try {
    const query = `
        EXEC NuevoEstado
            @nombre = :nombre;
        ;
     `;
    const [result, metadata] = await sequelize.query(query, {
      replacements: {
        nombre,
      },
      type: QueryTypes.SELECT,
    });
    return result;
  } catch (error) {
    throw error;
  }
};

export default createStateService;
