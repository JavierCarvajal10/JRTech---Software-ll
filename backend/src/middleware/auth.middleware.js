import { verifyToken } from "../services/auth.service.js";
import { ROLES, userHasAnyRole } from "../config/roles.js";
import { AUTH_COOKIE_NAME } from "../utils/cookies.js";

const extractToken = (req) => {
  // 1. Cookie httpOnly (preferida).
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (cookieToken) return cookieToken;

  // 2. Authorization header (compat: clientes no-browser, Postman, scripts).
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);

  return null;
};

export const requireAuth = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      message: "No autenticado. Inicia sesión.",
    });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email, rol: payload.rol };
    next();
  } catch (err) {
    return res.status(401).json({
      message: err.message,
      code: err.code ?? "TOKEN_INVALID",
    });
  }
};

// Variante: si hay token válido lo usa, si no, sigue sin error.
export const optionalAuth = (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email, rol: payload.rol };
  } catch {
    // Token inválido o expirado: tratamos como no autenticado, sin error.
  }
  next();
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }
  if (!userHasAnyRole(req.user.rol, roles)) {
    return res.status(403).json({
      message: `Acceso denegado. Se requiere rol: ${roles.join(" o ")}`,
    });
  }
  next();
};

export const requireAdmin = requireRole(ROLES.ADMIN);
export const requireOwner = requireRole(ROLES.OWNER);
