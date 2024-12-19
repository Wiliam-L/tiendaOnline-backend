import sequelize from "../config/db.js";
import { createProducts } from "../services/productsService.js";
import { getIdUserForCookie } from "../utils/token.js";

const MAX_SIZE = 10 * 1024 * 1024; //10MB

const createProductsController = async (req, res) => {
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

  //obtener id del usuario
  const id_usuario = getIdUserForCookie(req);

  try {
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
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ message: "El código no existe" });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "El código del producto ya en uso" });
    }

    if (
      error.message === "Faltan campos oblogatorios para crear el producto."
    ) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === "Precio no válido.") {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === "Código ya esta en uso") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "La cantidad para el stock no es válido.") {
      return res.status(400).json({ message: error.message });
    }
  }
};

export default createProductsController;
