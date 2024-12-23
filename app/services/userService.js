import sequelize from "../config/db.js";
import { Op, QueryTypes } from "@sequelize/core";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import User from "../model/user.js";
import { queryProcedureNuevoUsers } from "../utils/queryProcedureUtils.js";
import State from "../model/states.js";
import Rol from "../model/rol.js";

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

//creación del usuario -> cliente
export const createUser = async (
  rol_id,
  idestado = null,
  correo,
  nombre,
  password,
  telefono,
  fecha_nacimiento,
  options = {}
) => {
  if (fecha_nacimiento) {
  }

  try {
    //hashear contraseña
    const hashedPassword = await hashPassword(password);

    const query = queryProcedureNuevoUsers();
    //ejecutar el procedimiento almacenado
    const [results, metadata] = await sequelize.query(query, {
      replacements: {
        rol_id,
        idestado,
        correo,
        nombre,
        password: hashedPassword,
        telefono,
        fecha_nacimiento,
      },
      transaction: options.transaction,
      type: sequelize.QueryTypes.SELECT,
    });
    return results;
  } catch (error) {
    console.log(error);
    throw error;
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

    const user = await User.findOne({
      where: { correo_electronico: correo },
      include: [
        {
          model: State,
          attributes: ["nombre", "idestados"],
          where: { nombre: { [Op.like]: "activo" } },
        },
        {
          model: Rol,
          attributes: ["nombre", "idrol"],
        },
      ],
    });

    if (!user || !user.correo_electronico) {
      const error = new Error("El correo no está registrado");
      error.name = "Not_email";
      throw error;
    }

    if (!user.state.nombre) {
      const error = new Error("El usuario no está activo");
      error.name = "Not_active_user";
      throw error;
    }
    const password_hashs = user.password;
    const id_users = user.idusuarios;

    const { id_user, password_hash, status, nombre } = results[0];

    //verificar que el usuario este "activo"
    if (status !== "activo") {
      throw new Error("El usuario no está activo");
    }

    //validar la contraseña
    const isPasswordValid = await comparePassword(password, password_hash);
    if (!isPasswordValid) {
      const error = new Error("La contraseña es incorrecta");
      error.name = "Incorrect_password";
      throw error;
    }

    return { id: id_user, nombre };
  } catch (error) {
    throw error;
  }
};

//obtener todos los usuarios
export const getUser = async () => {
  try {
    return await User.findAll({ attributes: { exclude: ["password"] } });
  } catch (error) {
    throw error;
  }
};
