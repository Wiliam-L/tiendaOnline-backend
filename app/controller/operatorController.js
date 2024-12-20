import createOperator from "../services/operatorService.js";
import sequelize from "../config/db.js";

export const createOperatorController = async (req, res) => {
  const {
    rol_id,
    nombre,
    apellido,
    telefono,
    correo,
    password,
    fechaNacimiento,
  } = req.body;

  const requiredFields = [
    "nombre",
    "apellido",
    "telefono",
    "correo",
    "password",
    "rol_id",
  ];

  //validar que los campos obligatorios estén presentes
  for (const field of requiredFields) {
    if (req.body[field] === undefined || req.body[field] === "") {
      return res
        .status(400)
        .json({ message: `El campo ${field} es obligatorio` });
    }
  }

  //si fecha nacimiento no se envia, se asigna null
  if (fechaNacimiento === undefined) {
    fechaNacimiento = null;
  }

  try {
    await sequelize.transaction(async (t) => {
      await createOperator(
        rol_id,
        nombre,
        apellido,
        telefono,
        correo,
        password,
        fechaNacimiento,
        { transaction: t }
      );
    });

    return res.status(201).json({ message: "Operador creado con éxito" });
  } catch (error) {
    if (error.message === "El correo electrónico ya está registrado") {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "El correo electrónico ya está registrado" });
    }

    return res
      .status(500)
      .json({
        message: "Ocurrió un error en el servidor. Inténtalo más tarde.",
      });
  }
};
