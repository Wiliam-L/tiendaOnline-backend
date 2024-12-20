import createOperator from "../services/operatorService.js";
import sequelize from "../config/db.js";
import { QueryTypes } from "@sequelize/core";
import dotenv from "dotenv";
import createRolService from "../services/RolService.js";
import createStateService from "../services/stateService.js";

dotenv.config();

/**
 * Se crean los roles para usuarios       registrados o creado
 * Cliente -> rol "cliente"
 * Operador -> rol "operador"
 */
export const createRolesAutomatic = async (status) => {
  if (status === "TRUE") {
    const roles = ["Cliente", "Operador", "Administrador"];

    for (const rol of roles) {
      try {
        await createRolService(rol);
        console.log("Rol creado con éxito: ", rol);
      } catch (error) {
        console.log("Error al crear el rol: ", rol);
      }
    }
  }
};

/**
 * Se crean el rol "activo", "inactivo"
 * Los usuarios (creado ó registrados) se asignarán automaticamente el rol "activo"
 */

export const createStateAutomatic = async (status_create) => {
  const names = ["activo", "inactivo"];

  if (status_create === "TRUE") {
    for (const name of names) {
      try {
        await createStateService(name);
        console.log(`Estado creado: ${name}`);
      } catch (error) {
        console.log("Error al crear el estado: ", name);
      }
    }
  }
};

//crear automaticamente el operador
export const createOperatorAutomatic = async (status) => {
  const nombre = process.env.NOMBRE;
  const telefono = process.env.TELEFONO;
  const correo = process.env.CORREO;
  const password = process.env.PASSWORD;
  const fecha_nacimiento = null;

  if (status === "TRUE") {
    // Verificar si todos los datos necesarios están presentes
    if (!nombre || !telefono || !correo || !password) {
      return;
    }
    try {
      //verificar si el operadro ya existe
      const existingOperator = await sequelize.query(
        `
            SELECT * FROM usuarios WHERE correo_electronico = :correo;`,
        {
          replacements: { correo },
          type: QueryTypes.SELECT,
        }
      );

      if (existingOperator.length > 0) {
        console.log("El operador ya existe con ese correo electrónico.");
        return;
      }

      //Obtener id del rol -> administrador ó operador
      const [rol] = await sequelize.query(
        `
            SELECT idrol FROM rol WHERE LOWER(nombre) = 'operador' OR LOWER(nombre) = 'administrador';`,
        {
          query: QueryTypes.SELECT,
        }
      );

      if (!rol || !rol[0]) {
        console.log("Rol no encontrado.");
        return;
      }

      const rol_id = rol[0].idrol;
      await createOperator(
        rol_id,
        correo,
        nombre,
        password,
        telefono,
        fecha_nacimiento
      );

      console.log("Operador creado con éxito", correo);
    } catch (error) {
      //console.log(error);
      return;
    }
  }
};
