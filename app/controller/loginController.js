import { validateUserCredentials } from "../services/userService.js";
import { accessToken, refreshToken } from "../utils/token.js";

export const validate = async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios." });
  }
  try {
    //validar credenciales del usuario
    const result = await validateUserCredentials(correo, password);

    //generar el token de acceso y refresh
    const token = accessToken(result.id, result.nombre);
    const refresh = refreshToken(result.id, result.nombre);

    //configuración de la cookie
    res.cookie("access", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refresh", refresh, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Inicio de sesión exitoso.",
    });
  } catch (error) {

    if (error.message === "El correo no está registrado") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "El usuario no está activo") {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === "La contraseña es incorrecta") {
      return res.status(401).json({ message: error.message });
    }

    return res.status(500).json({ message: "Hubo un erro al iniciar sesión" });
  }
};
