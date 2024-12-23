import sequelize from "../config/db.js";
import { QueryTypes } from "@sequelize/core";
import dotenv from "dotenv";
import { createStateService } from "../services/stateService.js";
import { createRolService } from "../services/rolService.js";
import { createUser } from "../services/userService.js";
import { updateData } from "../utils/fileUtils.js";

dotenv.config();

export const createSystemData = async (status) => {
  const nombre = process.env.NOMBRE;
  const telefono = process.env.TELEFONO;
  const correo = process.env.CORREO;
  const password = process.env.PASSWORD;
  const fecha_nacimiento = null;

  if (status === "TRUE") {
    const roles = ["administrador", "operador", "cliente"];
    const states = ["activo", "inactivo"];

    try {
      await sequelize.transaction(async (t) => {
        // Crear roles si no existen
        for (const role of roles) {
          const existingRole = await sequelize.query(
            `SELECT * FROM rol WHERE LOWER(nombre) = :role`,
            {
              replacements: { role: role.toLowerCase() },
              type: QueryTypes.SELECT,
              transaction: t,
            }
          );

          if (existingRole.length === 0) {
            await createRolService(role, { transaction: t });
            console.log(`Rol creado: ${role}`);
          } else {
            console.log(`El rol ya existe: ${role}`);
          }
        }

        // Crear estados si no existen
        for (const state of states) {
          const existingState = await sequelize.query(
            `SELECT * FROM estados WHERE LOWER(nombre) = :state`,
            {
              replacements: { state: state.toLowerCase() },
              type: QueryTypes.SELECT,
              transaction: t,
            }
          );

          if (existingState.length === 0) {
            await createStateService(state, { transaction: t });
            console.log(`Estado creado: ${state}`);
          } else {
            console.log(`El estado ya existe: ${state}`);
          }
        }

        // Obtener solo el estado "activo"
        const activeState = await sequelize.query(
          `SELECT * FROM estados WHERE LOWER(nombre) = 'activo'`,
          {
            type: QueryTypes.SELECT,
            transaction: t,
          }
        );

        if (!activeState.length) {
          throw new Error(
            "El estado 'activo' no pudo ser creado ni encontrado."
          );
        }

        // Verificar si el correo ya existe
        const existingUser = await sequelize.query(
          `SELECT * FROM usuarios WHERE LOWER(correo_electronico) = :correo`,
          {
            replacements: { correo: correo.toLowerCase() },
            type: QueryTypes.SELECT,
            transaction: t,
          }
        );

        // Si el correo no existe, se crea el usuario como administrador
        if (existingUser.length === 0) {
          const adminRole = await sequelize.query(
            `SELECT * FROM rol WHERE LOWER(nombre) = 'administrador'`,
            {
              type: QueryTypes.SELECT,
              transaction: t,
            }
          );

          if (!adminRole.length) {
            throw new Error("El rol 'administrador' no pudo ser encontrado.");
          }

          const a = await createUser(
            adminRole[0].idrol,
            activeState[0].idestados,
            correo,
            nombre,
            password,
            telefono,
            fecha_nacimiento,

            { transaction: t }
          );
          console.log("Usuario administrador creado exitosamente.");
        } else {
          console.log("El correo ya está registrado.");
        }

        console.log("Datos iniciales creados exitosamente.");
      });

      updateData("CREATE_AUTOMATIC=FALSE");
    } catch (error) {
      console.error("Error al crear los datos iniciales:", error.message);
      throw error;
    }
  }
};
