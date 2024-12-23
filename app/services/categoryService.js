import Category from "../model/category.js";
import State from "../model/states.js";

//crear categoria
export const categoryService = async (id_usuario, nombre, id_estado) => {
  if (!id_usuario || !nombre || !id_estado) {
    throw new Error("Todos los datos son requeridos");
  }
  const state = await State.findByPk(id_estado);
  if (!state) {
    const error = new Error(`not id`);
    error.name = "SequelizeForeignKeyConstraintError";
    throw error;
  }

  try {
    const result = await Category.create({
      usuarios_idusuarios: id_usuario,
      nombre: nombre,
      estados_idestados: id_estado,
    });
    return result;
  } catch (error) {
    throw error;
  }
};

//actualizar categoria
export const updateCategoryService = async (
  idcategoria,
  dataToUpdate,
  options = {}
) => {
  try {
    const result = await Category.update(dataToUpdate, {
      where: { idCategoriaProductos: idcategoria },
      transaction: options.transaction,
    });
    return result;
  } catch (error) {
    throw error;
  }
};

//inactivar categoria
export const inactiveCategoryService = async (
  idcategoria,
  idestado,
  options = {}
) => {
  try {
    const result = await Category.update(
      { estados_idestados: idestado },
      {
        where: { idCategoriaProductos: idcategoria },
        transaction: options.transaction,
      }
    );
    return result;
  } catch (error) {
    throw error;
  }
};

//obtener todas las categorias
export const getCategoryService = async () => {
  try {
    return await Category.findAll();
  } catch (error) {
    throw error;
  }
};
