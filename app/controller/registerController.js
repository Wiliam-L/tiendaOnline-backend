import { createClient } from "../services/clientService.js";
import { createUser } from "../services/userService.js";
import sequelize from "../config/db.js";

const registerController = async (req, res) => {
  const { cliente, usuario } = req.body;

  try {
    await sequelize.transaction(async (t) => {
      //1. Crear cliente
      await createClient(
        cliente.razon_social,
        cliente.nombre_comercial,
        cliente.direccion_entrega,
        cliente.telefono,
        cliente.correo_electronico,
        { transaction: t }
      );

      //2. Crear usuario
      await createUser(
        usuario.rol_id,
        usuario.correo,
        usuario.nombre,
        usuario.password,
        usuario.telefono,
        usuario.fechaNacimiento,
        { transaction: t }
      );
    });

    // Si todo salió bien
    return res.status(201).json({
      message: "Usuario registrado correctamente",
    });
  } catch (error) {
    if (error.message === "El correo electrónico ya está registrado") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Hubo un error al crear el cliente",
      error: error.message,
    });
  }
};

export default registerController;
