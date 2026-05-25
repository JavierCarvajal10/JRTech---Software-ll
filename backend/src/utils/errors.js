// Manejo de errores seguro: separa los errores "operacionales" (seguros de
// mostrar al usuario, ej. validaciones) de los errores internos (Prisma, bugs)
// que NUNCA deben exponerse porque revelan detalles de la implementación.

const GENERIC_MESSAGE = "Ocurrió un error inesperado. Inténtalo de nuevo más tarde.";

/**
 * Error de aplicación: su mensaje SÍ es seguro de mostrar al usuario.
 * Úsalo en los servicios para validaciones y reglas de negocio.
 *   throw new AppError("Email y contraseña son obligatorios", 400);
 */
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

/**
 * Responde un error de forma segura.
 * - Si es un AppError -> devuelve su mensaje y status (seguro).
 * - Cualquier otro error (Prisma, TypeError, etc.) -> se registra en el
 *   servidor y al cliente solo le llega un mensaje genérico.
 */
export const sendError = (res, error) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  // Error interno/no controlado: lo registramos completo para depurar,
  // pero al cliente no le revelamos nada.
  console.error("[error interno]", error);
  return res.status(500).json({ message: GENERIC_MESSAGE });
};
