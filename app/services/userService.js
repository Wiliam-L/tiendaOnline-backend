import sequelize from "../config/db.js";
import { QueryTypes } from "@sequelize/core";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";

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

//validar credenciales del usuario
export const validateUserCredentials = async (correo, password) => {
  try {
    const results = await sequelize.query(
      `
      SELECT 
        u.idusuarios AS id_user,
        LOWER(r.nombre) as nombre,
        u.password AS password_hash,
        LOWER(e.nombre) AS status
      FROM usuarios AS u
      INNER JOIN
        estados AS e ON u.estados_idestados = e.idestados
      INNER JOIN rol AS r ON u.rol_idrol = r.idrol
      WHERE u.correo_electronico = :correo;
      `,
      {
        replacements: { correo },
        type: QueryTypes.SELECT,
      }
    );

    if (!results || results.length === 0) {
      throw new Error("El correo no está registrado");
    }

    const { id_user, password_hash, status, nombre } = results[0];

    //verificar que el usuario este "activo"
    if (status !== "activo") {
      throw new Error("El usuario no está activo");
    }

    //validar la contraseña
    const isPasswordValid = await comparePassword(password, password_hash);
    if (!isPasswordValid) {
      throw new Error("La contraseña es incorrecta");
    }

    return { id: id_user, nombre };
  } catch (error) {
    throw error;
  }
};

//obtener el rol y estado del usuario actual
export const getUserRoleAndStatus = async (userId) => {
  try {
    const query = `
    SELECT rol, estado
    FROM ViewgetUserRoleAndStatus
    WHERE idusuarios = : userId;`;

    const result = await sequelize.query(query, {
      replacements: { userId },
      type: QueryTypes.SELECT,
    });

    if (!result || result.length === 0) {
      throw new Error("Usuario no encontrado");
    }
    return result[0];
  } catch (error) {
    throw error;
  }
};
