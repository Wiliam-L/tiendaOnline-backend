import {
  createProducts,
  getProductsService,
  inactiveProductService,
  updateProductService,
} from "../services/productsService.js";
import State from "../model/states.js";
import Category from "../model/category.js";
import { Op } from "@sequelize/core";
import Product from "../model/product.js";
import Rol from "../model/rol.js";
import sequelize from "../config/db.js";

const MAX_SIZE = 5 * 1024 * 1024; //5MB

//crear producto
export const createProductsController = async (req, res, next) => {
  const { id_categoria, nombre, marca, codigo, stock, id_estado, precio } =
    req.body;

  //verificar si se cargo la foto
  const foto = req.file;

  if (!foto) {
    return res.status(400).json({ error: "No se ha cargado ninguna foto" });
  }

  //validar tipo de archivo (JPEG Y PNG)
  if (!["image/jpeg", "image/png"].includes(foto.mimetype)) {
    return res.status(400).json({ error: "Formato de archivo no soportado" });
  }

  //validar tamño máximo permitido
  if (foto.size > MAX_SIZE) {
    return res.status(400).json({ error: "El archivo es demasiado grande" });
  }

  //obtener binario de la imagen
  const ft_binary = foto.buffer;

  try {
    if (
      !id_categoria ||
      !nombre ||
      !marca ||
      !codigo ||
      !stock ||
      !id_estado ||
      !precio
    ) {
      const error = new Error("Todos los datos son requeridos");
      error.name = "FieldsRequiredError";
      throw error;
    }
    const id_usuario = req.user.id;
    const existingState = State.findByPk(id_estado);
    if (!existingState) {
      return res.status(400).json({ message: "Estado no existe" });
    }
    //verificar si existe el id categoria
    const existingIdCategoria = await Category.findByPk(
      parseInt(id_categoria),
      { include: { model: State, attributes: ["nombre"] } }
    );
    if (!existingIdCategoria) {
      return res.status(400).json({ message: "Categoria no existe" });
    }

    const stateName = existingIdCategoria.state.nombre;
    console.log(stateName);

    if (stateName != "activo") {
      return res.status(400).json({ message: "Categoria inactiva" });
    }

    await createProducts(
      parseInt(id_categoria),
      parseInt(id_usuario),
      nombre,
      marca,
      codigo,
      parseFloat(stock),
      parseInt(id_estado),
      parseFloat(precio),
      ft_binary
    );

    return res.status(201).json({ message: "Producto creado con éxito" });
  } catch (error) {
    next(error);
  }
};

// actualizar el producto
export const updateProductController = async (req, res, next) => {
  const { id_categoria, nombre, marca, codigo, stock, id_estado, precio } =
    req.body;
  const foto = req.file;
  const { id } = req.params;

  const dataToUpdate = {};

  try {
    if (id_categoria) {
      const categoria = await Category.findOne({
        where: {
          idCategoriaProductos: parseInt(id_categoria),
        },
        include: {
          model: State,
          attributes: ["nombre"],
        },
      });

      if (!categoria) {
        return res
          .status(400)
          .json({ message: "Categoría no encontrada o no está activa" });
      }

      dataToUpdate.CategoriaProductos_idCategoriaProductos = id_categoria;
    }

    // 2. Validar que el código no exista
    if (codigo) {
      const existingProduct = await Product.findOne({
        where: { codigo, idProductos: { [Op.ne]: id } },
      });
      if (existingProduct) {
        return res
          .status(400)
          .json({ message: "El código del producto ya existe" });
      }

      dataToUpdate.codigo = codigo;
    }

    if (id_estado) {
      const idestados = parseInt(id_estado);
      const estado = await State.findOne({ where: { idestados } });
      if (!estado) {
        return res.status(400).json({ message: "Estado no encontrado" });
      }
      dataToUpdate.estados_idestados = id_estado;
    }

    if (nombre) dataToUpdate.nombre = nombre;
    if (marca) dataToUpdate.marca = marca;
    if (stock) {
      if (stock >= 0) {
        dataToUpdate.stock = stock;
      } else {
        return res.status(400).json({ message: "Stock inválido" });
      }
    }
    if (precio) {
      if (precio >= 0) {
        dataToUpdate.precio = precio;
      } else {
        return res.status(400).json({ message: "Precio inválido" });
      }
    }

    if (foto) {
      //validar tipo de archivo (JPEG Y PNG)
      if (!["image/jpeg", "image/png"].includes(foto.mimetype)) {
        return res
          .status(400)
          .json({ error: "Formato de archivo no soportado" });
      }

      //validar tamño máximo permitido
      if (foto.size > MAX_SIZE) {
        return res
          .status(400)
          .json({ error: "El archivo es demasiado grande" });
      }

      //obtener binario de la imagen
      const foto_binary = foto.buffer;
      dataToUpdate.foto = foto_binary;
    }

    await updateProductService(id, dataToUpdate);

    return res
      .status(200)
      .json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    next(error);
  }
};

//inactivar producto
export const inactiveProductController = async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findOne({ where: { idProductos: id } });
    if (!product) {
      return res.status(400).json({ message: "Producto no encontrado" });
    }

    const inactiveState = await State.findOne({
      where: { nombre: "inactivo" },
    });
    if (!inactiveState) {
      return res.status(400).json({ message: "No se encontró el estado" });
    }

    await sequelize.transaction(async (t) => {
      await inactiveProductService(id, inactiveState.dataValues.idestados, {
        transaction: t,
      });
    });
    return res
      .status(200)
      .json({ message: "Producto inactivado correctamente" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//obtener todo los productos
export const getProductsController = async (req, res, next) => {
  try {
    const result = await getProductsService();
    return res.status(200).json({ products: result });
  } catch (error) {
    next(error);
  }
};
