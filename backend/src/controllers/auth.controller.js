import {
  loginUser,
  registerUser,
  getUserFromToken,
  requestPasswordReset,
  resetPassword,
} from "../services/auth.service.js";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  clearAuthCookieOptions,
} from "../utils/cookies.js";

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions());
};

export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    setAuthCookie(res, result.token);
    res.status(201).json({
      message: "Usuario creado correctamente",
      // El token también se devuelve en el body para clientes no-browser.
      data: result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    setAuthCookie(res, result.token);
    res.status(200).json({
      message: "Login exitoso",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const logout = async (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions());
  res.status(200).json({ message: "Sesión cerrada" });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await requestPasswordReset(email);
    res.status(200).json({
      message:
        "Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.",
      ...(result.devToken ? { devToken: result.devToken } : {}),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const resetPasswordHandler = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await resetPassword(token, newPassword);
    res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const me = async (req, res) => {
  try {
    // Lee el token desde cookie httpOnly o desde Authorization header.
    const token =
      req.cookies?.[AUTH_COOKIE_NAME] ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) {
      return res.status(401).json({ message: "No autenticado" });
    }
    const user = await getUserFromToken(token);
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
