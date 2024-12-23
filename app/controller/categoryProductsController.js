import { Op, where } from "@sequelize/core";
import Category from "../model/category.js";
import State from "../model/states.js";
import {
  categoryService,
  getCategoryService,
  inactiveCategoryService,
  updateCategoryService,
} from "../services/categoryService.js";
import sequelize from "../config/db.js";
import User from "../model/user.js";

//crear categoria
export const createCategoryController = async (req, res, next) => {
  const { nombre, id_estado } = req.body;
  const { id } = req.user;

  const existingUser = await User.findByPk(id);
  if (!existingUser) {
    return res.status(401).json({ message: "usuario no encontrado" });
  }

  const existingCategory = await Category.findOne({
    where: {
      nombre: { [Op.like]: nombre },
    },
  });

  if (existingCategory) {
    return res
      .status(400)
      .json({ message: "Nombre de la categoria ya existe" });
  }

  try {
    await categoryService(id, nombre, id_estado);
    return res.status(201).json({ message: "Categoria creada exitosamente" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//actualizar categoria
export const updateCategoryController = async (req, res, next) => {
  const idcategoria = req.params.id;
  const { id } = req.user;
  const { nombre, idestado } = req.body;

  try {
    if (!idcategoria || !id) {
      const error = new Error("campos requeridos");
      error.name = "FieldsRequiredError";
      throw error;
    }

    const existingCategory = await Category.findByPk(idcategoria);
    if (!existingCategory) {
      return res.status(400).json({ message: "Categoría no existe." });
    }

    const dataToUpdate = {};
    if (nombre) {
      const existingNameCategory = await Category.findOne({
        where: { nombre: { [Op.like]: nombre } },
      });

      if (existingNameCategory) {
        return res.status(400).json({ message: "El nombre ya existe." });
      }
      dataToUpdate.nombre = nombre;
    }

    if (idestado) {
      const existingState = State.findByPk(idestado);
      if (!existingState) {
        return res.status(400).json({ message: "Estado no existe." });
      }
      dataToUpdate.estados_idestados = idestado;
    }

    dataToUpdate.usuarios_idusuarios = id;

    await sequelize.transaction(async (t) => {
      await updateCategoryService(idcategoria, dataToUpdate, {
        transaction: t,
      });
    });

    return res.status(200).json({ message: "Categroría actualizada" });
  } catch (error) {
    next(error);
  }
};

//inactivar categoria
export const inactiveCategoryController = async (req, res, next) => {
  const idcategoria = req.params.id;
  let idestado = req.body.idestado;
  if (!idestado) {
    const existingStateActive = await State.findOne({
      attributes: ["idestados"],
      where: { nombre: { [Op.like]: "inactivo" } },
    });

    if (existingStateActive.dataValues) {
      idestado = existingStateActive.dataValues.idestados;
    } else
    
    return res.status(400).json({ message: "Esta 'activo' no encontrado" });
  }

  try {
    await sequelize.transaction(async (t) => {
      await inactiveCategoryService(idcategoria, idestado, { transaction: t });
    });

    return res
      .status(200)
      .json({ message: "Categoria inactivada correctamente" });
  } catch (error) {
    next(error);
  }
};

//obtener todas las categorias
export const getCategoryController = async (req, res, next) => {
  try {
    const result = await getCategoryService();
    return res.status(200).json({
      categories: result,
    });
  } catch (error) {
    next(error);
  }
};
