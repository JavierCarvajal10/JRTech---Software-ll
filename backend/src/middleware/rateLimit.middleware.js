import rateLimit from "express-rate-limit";

const message = (msg) => ({ message: msg });

// Global: protege la API completa contra abuso masivo de cualquier endpoint.
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: message("Demasiadas solicitudes. Intenta de nuevo en un momento."),
});

// Login: protege contra fuerza bruta sobre credenciales.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: message("Demasiados intentos de inicio de sesión. Intenta más tarde."),
});

// Forgot password: previene spam de correos y enumeración masiva.
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: message("Demasiadas solicitudes de recuperación. Intenta más tarde."),
});

// Chat con LLM: el endpoint usa APIs de pago (Gemini/Groq), limitar agresivo.
export const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: message("Has alcanzado el límite de mensajes. Intenta de nuevo en una hora."),
});

// Importaciones públicas: solo POST. Previene spam de la BD con datos PII.
export const importSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: message("Has enviado muchas solicitudes. Intenta más tarde."),
});

// Creación de órdenes (incluye guest checkout): previene spam de órdenes falsas.
export const orderCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: message("Has creado demasiadas órdenes. Intenta más tarde."),
});
