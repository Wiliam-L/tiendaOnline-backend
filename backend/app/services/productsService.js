import sequelize from "../config/db.js";
import { QueryTypes } from "@sequelize/core";
import Product from "../model/product.js";

//crear producto
export const createProducts = async (
  id_categoria,
  id_usuario,
  nombre,
  marca,
  codigo,
  stock,
  id_estado,
  precio,
  foto,
  options = {}
) => {
  //Validaciones
  if (
    !id_categoria ||
    !id_usuario ||
    !nombre ||
    !marca ||
    !codigo ||
    !stock ||
    !id_estado ||
    !precio ||
    !foto
  ) {
    throw new Error("FieldsRequiredError");
  }

  if (typeof precio !== "number" || isNaN(precio) || precio < 0) {
    throw new Error("Precio no válido.");
  }

  if (typeof stock != "number" || isNaN(stock) || stock < 0) {
    throw new Error("La cantidad para el stock no es válido.");
  }

  const query = `
    EXEC NuevoProducto
        @CategoriaProductos_idCategoriaProductos = :id_categoria,
        @usuarios_idusuarios = :id_usuario,
        @nombre = :nombre,
        @marca = :marca,
        @codigo = :codigo,
        @stock = :stock,
        @estados_idestados = :id_estado,
        @precio = :precio,
        @foto = :foto;`;

  try {
    const result = await sequelize.query(query, {
      replacements: {
        id_categoria,
        id_usuario,
        nombre,
        marca,
        codigo,
        stock,
        id_estado,
        precio,
        foto,
      },
      transaction: options.transaction,
      type: QueryTypes.SELECT,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

//obtener todos los productos
export const updateProductService = async (id, dataToUpdate, options = {}) => {
  try {
    const result = await Product.update(dataToUpdate, {
      where: {
        idProductos: id,
      },
      transaction: options.transaction,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

//inactivar producto
export const inactiveProductService = async (id, idinactive, options = {}) => {
  try {
    const result = await Product.update(
      { estados_idestados: idinactive },
      { where: { idProductos: id }, transaction: options.transaction }
    );
    return result;
  } catch (error) {
    throw error;
  }
};

//obtener todos los productos
export const getProductsService = async () => {
  try {
    const result = await Product.findAll();
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
