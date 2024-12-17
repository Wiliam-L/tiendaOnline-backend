import sequelize from "../config/db.js";
import { QueryTypes } from "@sequelize/core";

//crear un cliente
export const createClient = async (
  razon_social,
  nombre_comercial,
  direccion_entrega,
  telefono,
  correo_electronico,
  options = {}
) => {
  const query = `
    EXEC NuevoCliente
        @razon_social = :razon_social,
        @nombre_comercial = :nombre_comercial,
        @direccion_entrega = :direccion_entrega,
        @telefono = :telefono,
        @correo_electronico = :correo_electronico;
  `;

  try {
    const [resultados, metadata] = await sequelize.query(query, {
      replacements: {
        razon_social,
        nombre_comercial,
        direccion_entrega,
        telefono,
        correo_electronico,
      },
      transaction: options.transaction,
      type: QueryTypes.SELECT,
    });
    return resultados;
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("El correo electrónico ya está registrado");
    } else {
      throw new Error("Hubo un error al crear el cliente");
    }
  }
};

{
}
