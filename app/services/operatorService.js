import sequelize from "../config/db.js";
import { QueryTypes } from "@sequelize/core";
import { hashPassword } from "../utils/passwordUtils.js";

const createOperator = async (
  idrol,
  correo,
  nombre,
  password,
  telefono,
  fecha_nacimiento
) => {
  const t = await sequelize.transaction();

  try {
    const hashedPassword = await hashPassword(password);
    const query = `
            EXEC NuevoOperador
                @rol_idrol = :idrol, 
                @correo_electronico = :correo, 
                @nombre_completo = :nombre, 
                @password = :password,
                @telefono = :telefono,
                @fecha_nacimiento = :fecha_nacimiento;
        `;
    const [result, metadata] = await sequelize.query(query, {
      replacements: {
        idrol,
        correo,
        nombre,
        password: hashedPassword,
        telefono,
        fecha_nacimiento,
      },
      transaction: t,
      type: QueryTypes.SELECT,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("El correo electrónico ya está registrado");
    }
  }
};

export default createOperator;
