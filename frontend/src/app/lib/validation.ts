// Single source of truth for validation rules used across forms.
// Cualquier ajuste de límite o regex se hace acá y se propaga a todos los
// formularios que lo importan. Mantener sincronizado con las validaciones
// del backend (req. body validation) si cambian.

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
} as const;
