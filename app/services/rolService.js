import sequelize from "../config/db.js";
import { QueryTypes } from "@sequelize/core";

const createRolService = async (nombre) => {
  try {
    const query = `
        EXEC NuevoRol
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

export default createRolService;
