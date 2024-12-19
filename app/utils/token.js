import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

//generar token de acceso
export const accessToken = (iduser, rol) => {
  const token = jwt.sign({ id: iduser, rol: rol }, SECRET_KEY, {
    expiresIn: "24h",
  });
  return token;
};

//generar token de refresco
export const refreshToken = (iduser, rol) => {
  const refresh = jwt.sign({ id: iduser, rol }, SECRET_KEY, {
    expiresIn: "3d",
  });
  return refresh;
};

//obtener el nuevo token de acceso usando el refrshToken
export const getNewToken = (req, res, next) => {
  const refresh = req.cookies.refresh;
  console.log(refresh);
  if (!refresh) {
    return res
      .status(401)
      .json({ message: "No se puede recuperar el token de acceso" });
  }

  try {
    const decoded = jwt.verify(refresh, SECRET_KEY);
    const token = accessToken(decoded.id, decoded.rol);
    res.cookie("access", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: "Token de acceso actualizado" });
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Refresh token inválido o expirado." });
  }
};

//comprobar si el token de acceso es válido
export const validateAccessToken = (req, res) => {
  const token = req.cookies.access;
  if (!token) {
    return res.status(401).json({ message: "No se encontro el token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado" });
    }
  }
};

//comprobar el rol del usuario actual
export const checkRole = (roles) => {
  return (req, res, next) => {
    const decoded = validateAccessToken(req, res);

    if (!roles.includes(decoded.rol)) {
      return res
        .status(403)
        .json({ message: "No tiene permisos para este recurso" });
    }

    next();
  };
};

//obtener el id del usuario actual
export const getIdUserForCookie = (req) => {
  const decoded = validateAccessToken(req);
  if (!decoded) {
    return null;
  }
  return decoded.id;
};
