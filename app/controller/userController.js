import { createCustomer } from "../services/customerService.js";
import { createUser, getUser } from "../services/userService.js";
import sequelize from "../config/db.js";
import State from "../model/states.js";
import { Op } from "@sequelize/core";
import Rol from "../model/rol.js";

//validar que los datos requeridos estén presentes
const requiredFields = (fields, name) => {
  for (const field of fields) {
    if (!name[field]) {
      return `Falta el campo obligatorio '${field}'`;
    }
  }
  return null;
};

//logica para registrar nuevo usuario con rol ['Cliente']
export const registerUserController = async (req, res, next) => {
  const { cliente, usuario } = req.body;
  let fecha_nacimiento = req.body.fecha_nacimiento;

  if (!cliente || !usuario) {
    return res.status(400).json({
      message: "Faltan datos obligatorios: 'cliente' y/o 'usuario'.",
    });
  }

  //fields required
  const fieldsCustomer = [
    "razon_social",
    "nombre_comercial",
    "direccion_entrega",
    "telefono",
    "correo_electronico",
  ];
  const fieldUser = ["correo", "nombre", "telefono", "password"];

  const isCompleteFieldsCustomer = requiredFields(fieldsCustomer, cliente);
  if (isCompleteFieldsCustomer) {
    return res.status(400).json({ message: isCompleteFieldsCustomer });
  }
  const isCompleteFieldUser = requiredFields(fieldUser, usuario);
  if (isCompleteFieldUser) {
    return res.status(400).json({ message: isCompleteFieldUser });
  }

  if (!fecha_nacimiento) {
    fecha_nacimiento = null;
  }

  //obtener el id del rol "cliente"
  const role = await Rol.findOne({
    where: {
      nombre: { [Op.like]: "cliente" },
    },
  });

  if (!role) {
    return res.status(400).json({
      message: "No se encontró el rol cliente",
    });
  }

  //obtener el id del estado 'activo'
  const state = await State.findOne({
    where: { nombre: { [Op.like]: "activo" } },
  });

  if (!state) {
    return res.status(400).json({ message: "id del estado no encontrado" });
  }

  try {
    await sequelize.transaction(async (t) => {
      //1. Crear cliente
      await createCustomer(
        cliente.razon_social,
        cliente.nombre_comercial,
        cliente.direccion_entrega,
        cliente.telefono,
        cliente.correo_electronico,
        { transaction: t }
      );

      //2. Crear usuario
      await createUser(
        role.idrol,
        null,
        usuario.correo,
        usuario.nombre,
        usuario.password,
        usuario.telefono,
        fecha_nacimiento,
        { transaction: t }
      );
    });

    // Si todo salió bien
    return res.status(201).json({
      message: "Usuario registrado correctamente",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

//logica para crear nuevo usuario con roles ['administrador', 'operador']
export const registerUserOperatorController = async (req, res, next) => {
  const { rol_id, correo, nombre, password, telefono } = req.body;
  let fecha_nacimiento = req.body.fecha_nacimiento;
  let id_estado = req.body.id_estado;

  if (!rol_id || !correo || !nombre || !password || !telefono) {
    return res.status(400).json({
      message: "Faltan datos requeridos",
    });
  }

  if (!fecha_nacimiento) {
    fecha_nacimiento = null;
  }

  try {
    //se asigna null, si no se proporciona id del estado, si es null, se dejará activo
    if (!id_estado) {
      id_estado = null;
    } else {
      //si se proporciona el id del estado, se comprueba si existe
      const state = await State.findOne({
        where: { idestados: id_estado },
      });

      if (!state) {
        return res.status(400).json({ message: "id del estado no encontrado" });
      }

      id_estado = state.idestados;
    }

    //validar que el rol existea y que no sea cliente
    const role = await Rol.findOne({
      where: {
        idrol: rol_id,
        nombre: { [Op.notLike]: "Cliente" },
      },
    });

    if (!role) {
      return res.status(400).json({
        message: "Rol no encontrado o el rol es [cliente]",
      });
    }

    const idrol = role.idrol;
    await createUser(
      idrol,
      id_estado,
      correo,
      nombre,
      password,
      telefono,
      fecha_nacimiento
    );
    return res.status(201).json({ message: "usuario creado correctamente" });
  } catch (error) {
    next(error);
  }
};

//logica para obtener todos los usuariosz
export const getUserController = async (req, res, next) => {
  try {
    const result = await getUser();
    return res.status(200).json({ users: result });
  } catch (error) {
    next(error);
  }
};
