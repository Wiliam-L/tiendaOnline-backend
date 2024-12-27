import jwt from "jsonwebtoken";
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware para comprobar el token de acceso y el rol del usuario
export const checkRole = (roles) => {
  return (req, res, next) => {
    //validar el token
    const token = req.cookies.access;
    if (!token) {
      return res
        .status(401)
        .json({ message: "No se encontró el token de acceso" });
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = decoded;

      //obtener el rol
      const { rol } = req.user;
      if (!roles.includes(rol)) {
        return res
          .status(403)
          .json({ message: "No tiene permisos para este recurso" });
      }
      next();
    } catch (error) {
      return res
        .status(403)
        .json({ message: "Token de acceso inválido o expirado" });
    }
  };
};
