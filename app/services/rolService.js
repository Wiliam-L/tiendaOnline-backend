import Rol from "../model/rol.js";
import rolModel from "../model/rol.js";

export const createRolService = async (nombre, options = {}) => {
  try {
    const create = await rolModel.create(
      { nombre },
      { transaction: options.transaction }
    );
    return create;
  } catch (error) {
    throw error;
  }
};

//update rol
export const updateRolService = async (idrol, nombre, options = {}) => {
  try {
    const result = await Rol.update(
      { nombre: nombre },
      { where: { idrol: idrol }, transaction: options.transaction }
    );
    return result;
  } catch (error) {
    throw error;
  }
};

//obtener roles
export const getRol = async () => {
  try {
    return await rolModel.findAll();
  } catch (error) {
    throw error;
  }
};
