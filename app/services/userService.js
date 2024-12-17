import sequelize from "../config/db.js";
import { hashPassword } from "../utils/passwordUtils.js";

export const createUser = async (
  rol_id,
  correo,
  nombre,
  password,
  telefono,
  fechaNacimiento,
  options = {}
) => {
  try {
    //hashear contraseña
    const hashedPassword = await hashPassword(password);

    const query = `
        EXEC NuevoUsuario
            @rol_idrol = :rol_id, 
            @correo_electronico = :correo, 
		        @nombre_completo = :nombre, 
            @password = :password,
            @telefono = :telefono,
		        @fecha_nacimiento = :fechaNacimiento;
        `;
    //ejecutar el procedimiento almacenado
    const [resultados, metadata] = await sequelize.query(query, {
      replacements: {
        rol_id,
        correo,
        nombre,
        password: hashedPassword,
        telefono,
        fechaNacimiento,
      },
      transaction: options.transaction,
      type: sequelize.QueryTypes.SELECT,
    });
    return resultados;
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("El correo electrónico ya está registrado");
    } else {
      throw new Error("Hubo un error al crear el usuario");
    }
  }
};
