import sequelize from "../config/db.js";
import { createProducts } from "../services/productsService.js";

const MAX_SIZE = 10 * 1024 * 1024; //10MB

const createProductsController = async (req, res) => {
  const {
    id_producto,
    id_categoria,
    id_usuario,
    nombre,
    marca,
    codigo,
    stock,
    id_estado,
    precio,
  } = req.body;

  //verificar si se cargo la foto
  const foto = req.file;

  if (!foto) {
    console.log(req.files);
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

  //Obtener binario de la imagen
  const ft_binary = foto.buffer;
  console.log(typeof ft_binary);
};

export default createProductsController;
