// Validación de fortaleza de contraseña (servidor). Mantener sincronizado con
// frontend/src/app/lib/validation.ts -> PASSWORD_RULES / getPasswordError.
// Solo se usa al CREAR o CAMBIAR contraseñas, nunca en el login (para no
// bloquear a usuarios con contraseñas antiguas más débiles).
import { AppError } from "./errors.js";

export const PASSWORD_RULES = { min: 8, max: 64 };

/**
 * Lanza un AppError (mensaje seguro de mostrar) si la contraseña no cumple las
 * reglas: 8-64 caracteres, al menos una mayúscula y al menos un número.
 */
export const validatePasswordStrength = (password) => {
  if (typeof password !== "string" || password.length < PASSWORD_RULES.min) {
    throw new AppError(`La contraseña debe tener al menos ${PASSWORD_RULES.min} caracteres`);
  }
  if (password.length > PASSWORD_RULES.max) {
    throw new AppError(`La contraseña no puede superar ${PASSWORD_RULES.max} caracteres`);
  }
  if (!/[A-Z]/.test(password)) {
    throw new AppError("La contraseña debe incluir al menos una mayúscula");
  }
  if (!/\d/.test(password)) {
    throw new AppError("La contraseña debe incluir al menos un número");
  }
};
