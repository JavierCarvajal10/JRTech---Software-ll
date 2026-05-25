import {
  createUser,
  findUserByEmail,
  findUserById,
  setResetPasswordToken,
  findUserByResetTokenHash,
  clearResetPasswordToken,
} from "../repositories/auth.repository.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { sendPasswordResetEmail } from "./email.service.js";
import { AppError } from "../utils/errors.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido en las variables de entorno");
}

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  rol: user.rol,
  primerNombre: user.primerNombre,
  segundoNombre: user.segundoNombre,
  primerApellido: user.primerApellido,
  segundoApellido: user.segundoApellido,
  telefono: user.telefono,
  fechaCreacion: user.fechaCreacion,
});

export const registerUser = async (data) => {
  const { email, password, primerNombre, primerApellido } = data;

  if (!email || !password || !primerNombre || !primerApellido) {
    throw new AppError("Email, contraseña, primer nombre y primer apellido son obligatorios");
  }

  if (password.length < 6) {
    throw new AppError("La contraseña debe tener al menos 6 caracteres");
  }

  const existingUser = await findUserByEmail(email.toLowerCase());
  if (existingUser) {
    throw new AppError("Ya existe un usuario con ese email");
  }

  const hashed = await hashPassword(password);

  const user = await createUser({
    email: email.toLowerCase(),
    contraseñaHash: hashed,
    primerNombre,
    primerApellido,
  });

  const token = signToken(user);
  return { token, user: publicUser(user) };
};

export const loginUser = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new AppError("Email y contraseña son obligatorios");
  }

  const user = await findUserByEmail(email.toLowerCase());
  if (!user) {
    throw new AppError("Credenciales inválidas", 401);
  }

  const isValid = await comparePassword(password, user.contraseñaHash);
  if (!isValid) {
    throw new AppError("Credenciales inválidas", 401);
  }

  const token = signToken(user);
  return { token, user: publicUser(user) };
};

export const getUserFromToken = async (token) => {
  const payload = verifyToken(token);
  const user = await findUserById(payload.id);
  if (!user) throw new AppError("Usuario no encontrado", 401);
  return publicUser(user);
};

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

const hashResetToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

export const requestPasswordReset = async (email) => {
  if (!email || typeof email !== "string") {
    throw new AppError("Email es obligatorio");
  }

  const normalized = email.trim().toLowerCase();
  const user = await findUserByEmail(normalized);

  // Por seguridad: nunca revelar si el email existe o no.
  // Si el usuario no existe, retornamos como si todo hubiera salido bien.
  if (!user) return { ok: true };

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await setResetPasswordToken(user.id, tokenHash, expiresAt);

  try {
    await sendPasswordResetEmail({
      to: user.email,
      name: user.primerNombre,
      token: rawToken,
    });
  } catch (e) {
    console.error("Error enviando email de recuperación:", e.message);
    // En desarrollo: si falla el envío, devolvemos el token para poder probar.
    // En producción nunca debería exponerse.
    if (process.env.NODE_ENV !== "production") {
      return { ok: true, devToken: rawToken };
    }
    throw new AppError("No se pudo enviar el correo de recuperación. Intenta más tarde.", 502);
  }

  return { ok: true };
};

export const resetPassword = async (rawToken, newPassword) => {
  if (!rawToken) throw new AppError("Token de recuperación inválido");
  if (!newPassword || newPassword.length < 6) {
    throw new AppError("La nueva contraseña debe tener al menos 6 caracteres");
  }

  const tokenHash = hashResetToken(rawToken);
  const user = await findUserByResetTokenHash(tokenHash);
  if (!user) {
    throw new AppError("El enlace de recuperación es inválido o ha expirado");
  }

  const newHash = await hashPassword(newPassword);
  await clearResetPasswordToken(user.id, newHash);

  return { ok: true };
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const e = new Error("Token expirado");
      e.code = "TOKEN_EXPIRED";
      throw e;
    }
    const e = new Error("Token inválido");
    e.code = "TOKEN_INVALID";
    throw e;
  }
};
