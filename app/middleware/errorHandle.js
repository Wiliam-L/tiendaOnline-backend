const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return;
  }

  // Maneja errores específicos de Sequelize
  const sequelizeErrors = [
    "SequelizeUniqueConstraintError",
    "SequelizeForeignKeyConstraintError",
    "SequelizeBaseError",
    "SequelizeDatabaseError",
    "SequelizeValidationError",
  ];

  // Maneja errores relacionados con JWT
  const jwtErrors = ["TokenExpiredError", "JsonWebTokenError"];

  // Si el error es de Sequelize, maneja esos errores
  if (sequelizeErrors.includes(err.name)) {
    let message = "Ocurrió un error con la base de datos.";
    let value = err.errors ? err.errors[0].value : "";

    if (err.name === "SequelizeUniqueConstraintError" && value) {
      message = `${value} ya está registrado.`;
    }

    if (err.name === "SequelizeForeignKeyConstraintError") {
      message = `No existe`;
    }

    return res.status(400).json({ message, error: err.name, value });
  }

  // Si el error es de JWT, maneja esos errores
  if (jwtErrors.includes(err.name)) {
    return res.status(401).json({
      message:
        err.name === "TokenExpiredError" ? "Token expirado" : "Token inválido",
    });
  }

  // Maneja errores personalizados
  const customErrors = [
    { name: "Not_email", status: 404, message: "Correo no encontrado" },
    { name: "Not_active_user", status: 403, message: "Usuario no activo" },
    {
      name: "Incorrect_password",
      status: 404,
      message: "Contraseña incorrecta",
    },
    {
      name: "FieldsRequiredError",
      status: 400,
      message: "Faltan campos requeridos",
    },
  ];

  for (let error of customErrors) {
    if (err.name === error.name) {
      return res.status(error.status).json({ message: error.message });
    }
  }

  // Si el error no es manejado, devuelve un error genérico
  return res.status(500).json({
    message: "Ocurrió un error inesperado. Inténtalo más tarde.",
  });
};

export default errorHandler;
