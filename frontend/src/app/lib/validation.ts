// Single source of truth for validation rules used across forms.
// Cualquier ajuste de límite o regex se hace acá y se propaga a todos los
// formularios que lo importan. Mantener sincronizado con las validaciones
// del backend (req. body validation) si cambian.
import type { KeyboardEvent } from "react";

export const FIELD_LIMITS = {
  // Identidad y contacto
  firstName: 50,
  lastName: 50,
  fullName: 100,
  email: 254, // RFC 5321
  phone: 20,
  city: 80,
  address: 200,
  // Auth
  password: 100, // tope superior; el mínimo se define por uso (ver MIN_PASSWORD)
  // Productos
  productName: 120,
  productDescription: 2000,
  url: 500,
  categoryName: 80,
  // Texto libre
  notes: 500,
  description: 1000,
  searchQuery: 100,
  chatMessage: 2000,
} as const;

// Mínimos donde aplica. No tocamos mínimos existentes (ej: password = 6 en
// ResetPassword) para no romper flujos en producción — solo se referencian
// desde formularios nuevos o donde el usuario lo pida explícitamente.
export const MIN_PASSWORD = 6;

// Límites numéricos para precios, stock y cantidades. Mantener sincronizado
// con las validaciones del backend (ver backend/src/utils/numbers.js).
// Todos los valores son números enteros salvo el precio en USD (importaciones).
export const NUMERIC_LIMITS = {
  priceCOP: { min: 0, max: 999_999_999 }, // precio de productos (COP, entero)
  priceUSD: { min: 1, max: 1_000_000 }, // precio estimado importaciones (USD)
  stock: { min: 0, max: 1_000_000 }, // existencias de un producto
  cartQuantity: { min: 1, max: 1_000 }, // cantidad por item en carrito/orden
  importQuantity: { min: 1, max: 999 }, // cantidad en una solicitud de importación
} as const;

// Bloquea las teclas que <input type="number"> SÍ acepta pero que no queremos:
// notación científica (e/E), signos (+/-) y, para enteros, separadores decimales.
// Uso:  onKeyDown={blockInvalidNumberKeys()}            // solo enteros positivos
//       onKeyDown={blockInvalidNumberKeys(true)}        // permite decimales
export const blockInvalidNumberKeys =
  (allowDecimal = false) =>
  (e: KeyboardEvent<HTMLInputElement>) => {
    const blocked = ["e", "E", "+", "-"];
    if (!allowDecimal) blocked.push(".", ",");
    if (blocked.includes(e.key)) e.preventDefault();
  };

// Regex de uso común. Mantener simples — validaciones más estrictas viven
// en backend.
export const PATTERNS = {
  // No usa RFC completo a propósito: cubre los casos prácticos sin falsos
  // positivos comunes (acepta "+", subdominios, TLDs largos).
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  // Teléfono internacional permisivo: dígitos, espacios, +, (), -. Largo
  // mínimo 7 para evitar números obviamente inválidos.
  phone: /^[+\d][\d\s()+-]{6,}$/,
  // URL http/https. Para imágenes del catálogo.
  url: /^https?:\/\/.+/i,
} as const;

// Mensajes reutilizables — evita strings inconsistentes entre formularios.
export const MESSAGES = {
  required: "Este campo es obligatorio",
  email: "Email inválido",
  phone: "Teléfono inválido (mínimo 7 dígitos)",
  url: "Debe empezar por http:// o https://",
  passwordsDontMatch: "Las contraseñas no coinciden",
  maxLength: (n: number) => `Máximo ${n} caracteres`,
  minLength: (n: number) => `Mínimo ${n} caracteres`,
  min: (n: number) => `Mínimo ${n}`,
  max: (n: number) => `Máximo ${n.toLocaleString("es-CO")}`,
  integer: "Debe ser un número entero",
  positive: "Debe ser un número mayor a 0",
  nonNegative: "No puede ser negativo",
  onlyNumbers: "Solo se permiten números",
} as const;
