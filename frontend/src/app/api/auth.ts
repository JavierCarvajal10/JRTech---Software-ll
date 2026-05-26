import { apiRequest } from "./client";
import { setAuthToken, clearAuthToken } from "./token";

export type Role = "OWNER" | "ADMIN" | "CLIENTE";

const ROLE_GRANTS: Record<Role, Role[]> = {
  OWNER: ["OWNER", "ADMIN", "CLIENTE"],
  ADMIN: ["ADMIN", "CLIENTE"],
  CLIENTE: ["CLIENTE"],
};

export const userHasRole = (userRole: Role | undefined, required: Role): boolean => {
  if (!userRole) return false;
  return ROLE_GRANTS[userRole]?.includes(required) ?? false;
};

export interface AuthUser {
  id: number;
  email: string;
  rol: Role;
  primerNombre: string;
  segundoNombre?: string | null;
  primerApellido: string;
  segundoApellido?: string | null;
  telefono?: string | null;
  fechaCreacion?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterInput {
  email: string;
  password: string;
  primerNombre: string;
  primerApellido: string;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await apiRequest<{ data: AuthResponse }>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  // Guardamos el token como FALLBACK a la cookie (necesario para iOS/Safari móvil).
  setAuthToken(res.data.token);
  return res.data;
};

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const res = await apiRequest<{ data: AuthResponse }>("/api/auth/register", {
    method: "POST",
    body: input,
  });
  setAuthToken(res.data.token);
  return res.data;
};

export const fetchMe = async (): Promise<AuthUser> => {
  const res = await apiRequest<{ data: AuthUser }>("/api/auth/me");
  return res.data;
};

export const logout = async (): Promise<void> => {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } finally {
    // Aun si la llamada falla (red, 401, etc.), borramos el token local
    // para que el cliente quede en estado "no autenticado".
    clearAuthToken();
  }
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await apiRequest("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  await apiRequest("/api/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
  });
};
