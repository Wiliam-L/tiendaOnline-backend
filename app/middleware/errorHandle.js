const errorHandler = (err, req, res, next) => {
  if (err.name === "SequelizeUniqueConstraintError") {
    let valuerror = "";
    if (err.errors && err.errors[0].value) {
      valuerror = err.errors[0].value;
    }
    return res.status(400).json({
      message: valuerror
        ? `El valor ${valuerror} ya está registrado.`
        : "El recurso ya existe. Verifica los datos enviados",
    });
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      message: "El ID proporcionado no es válido o no existe.",
    });
  }

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: "Datos inválidos. Verifica los campos enviados.",
      errors: err.errors.map((e) => e.message),
    });
  }

  // Otros errores no manejados específicamente
  console.error(err); // Registrar el error para depuración
  res.status(500).json({
    message: "Ocurrió un error inesperado. Inténtalo más tarde.",
  });
};

export default errorHandler;
