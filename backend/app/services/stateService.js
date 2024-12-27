import State from "../model/states.js";
import stateModel from "../model/states.js";

//crear estado
export const createStateService = async (nombre, options = {}) => {
  if (!nombre) {
    const error = new Error("");
    error.name = "FieldsRequiredError";
    throw error;
  }
  try {
    const result = await stateModel.create(
      { nombre },
      { transaction: options.transaction }
    );
    return result;
  } catch (error) {
    throw error;
  }
};

//actualizar estado
export const updateStateService = async (idestado, nombre, options = {}) => {
  try {
    const result = await State.update(
      { nombre: nombre },
      { where: { idestados: idestado }, transaction: options.transaction }
    );
    console.log(result);
    return result;
  } catch (error) {
    throw error;
  }
};

//obtener estados
export const getStateService = async () => {
  try {
    return await stateModel.findAll();
  } catch (error) {
    throw error;
  }
};
