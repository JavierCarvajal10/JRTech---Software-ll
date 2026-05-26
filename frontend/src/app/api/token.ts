// Manejo del token JWT en localStorage como FALLBACK a la cookie httpOnly.
// Motivo: iOS/Safari móvil bloquea o descarta cookies cross-site (frontend en
// vercel.app, backend en onrender.com). Cuando eso pasa, /me y demás endpoints
// protegidos fallan con 401. Con el token en localStorage podemos mandar
// "Authorization: Bearer <token>" como respaldo y el backend ya lo acepta.
//
// El backend devuelve el token en el body de /login y /register; aquí lo
// guardamos y luego el cliente HTTP lo adjunta a cada petición.

const TOKEN_KEY = "jrtech_auth_token";

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    // localStorage puede no estar disponible (modo privado, SSR, etc.).
    return null;
  }
};

export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Ignoramos: la cookie seguirá funcionando como mecanismo principal.
  }
};

export const clearAuthToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // sin acción
  }
};
