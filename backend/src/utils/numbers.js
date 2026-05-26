// Validación numérica autoritativa (servidor). Mantener sincronizado con
// frontend/src/app/lib/validation.ts -> NUMERIC_LIMITS.
import { AppError } from "./errors.js";

export const NUM_LIMITS = {
  priceCOP: { min: 0, max: 999_999_999 }, // precio de productos (COP, entero)
  priceUSD: { min: 0, max: 1_000_000 }, // presupuesto importaciones (USD)
  stock: { min: 0, max: 1_000_000 }, // existencias de un producto
  orderQuantity: { min: 1, max: 1_000 }, // cantidad por item en una orden
  importQuantity: { min: 1, max: 999 }, // cantidad en una solicitud de importación
};

/**
 * Valida y normaliza un valor numérico. Lanza AppError (mensaje seguro) si no
 * cumple. Devuelve el número ya convertido.
 *
 * @param {*} value             valor crudo (string o number)
 * @param {string} label        nombre del campo para el mensaje (ej. "El precio")
 * @param {object} opts
 * @param {number} opts.min     mínimo permitido (inclusivo)
 * @param {number} opts.max     máximo permitido (inclusivo)
 * @param {boolean} opts.integer  exigir entero (default true)
 */
export const validateNumber = (value, label, { min, max, integer = true } = {}) => {
  const n = Number(value);

  if (value === "" || value === null || value === undefined || Number.isNaN(n)) {
    throw new AppError(`${label} debe ser un número válido`);
  }
  if (integer && !Number.isInteger(n)) {
    throw new AppError(`${label} debe ser un número entero`);
  }
  if (min !== undefined && n < min) {
    throw new AppError(
      min === 0 ? `${label} no puede ser negativo` : `${label} debe ser mayor o igual a ${min}`
    );
  }
  if (max !== undefined && n > max) {
    throw new AppError(`${label} no puede ser mayor a ${max.toLocaleString("es-CO")}`);
  }
  return n;
};
