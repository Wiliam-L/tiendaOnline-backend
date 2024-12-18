import sequelize from "../config/db.js";
import { QueryTypes } from "@sequelize/core";

export const createProducts = async (
  id_producto,
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
    throw new Error("Faltan campos oblogatorios para crear el producto.");
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
        id_producto,
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
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("Código ya esta en uso");
    }
    throw new Error("Hubo un error al crear el producto");
  }
};
