// Configuración del cookie JWT (httpOnly).
// En prod (cross-site Vercel↔Render) requiere SameSite=None + Secure.
// En dev (localhost↔localhost) usamos Lax sin Secure para permitir HTTP.

export const AUTH_COOKIE_NAME = "jrtech_token";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const authCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: SEVEN_DAYS_MS,
    path: "/",
  };
};

export const clearAuthCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };
};
