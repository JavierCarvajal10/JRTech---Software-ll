import { apiRequest } from "./client";
import type { Role } from "./auth";

export interface AdminUser {
  id: number;
  email: string;
  rol: Role;
  primerNombre: string;
  segundoNombre?: string | null;
  primerApellido: string;
  segundoApellido?: string | null;
  telefono?: string | null;
  fechaCreacion: string;
}

export interface CreateAdminInput {
  email: string;
  password: string;
  primerNombre: string;
  primerApellido: string;
}

export const listUsers = async (rol?: Role): Promise<AdminUser[]> => {
  const query = rol ? `?rol=${rol}` : "";
  const res = await apiRequest<{ data: AdminUser[] }>(`/api/usuarios${query}`);
  return res.data;
};

export const promoteUser = async (id: number): Promise<AdminUser> => {
  const res = await apiRequest<{ data: AdminUser }>(`/api/usuarios/${id}/promote`, {
    method: "PATCH",
  });
  return res.data;
};

export const demoteUser = async (id: number): Promise<AdminUser> => {
  const res = await apiRequest<{ data: AdminUser }>(`/api/usuarios/${id}/demote`, {
    method: "PATCH",
  });
  return res.data;
};

export const createAdmin = async (input: CreateAdminInput): Promise<AdminUser> => {
  const res = await apiRequest<{ data: AdminUser }>("/api/usuarios", {
    method: "POST",
    body: input,
  });
  return res.data;
};

export interface UpdateProfileInput {
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  telefono?: string;
}

export interface MyAddress {
  id: number;
  usuarioId: number;
  direccion: string;
  ciudad: string | null;
  departamento: string | null;
  pais: string | null;
  codigoPostal: string | null;
}

export interface AddressInput {
  direccion: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  codigoPostal?: string;
}

export const updateMyProfile = async (input: UpdateProfileInput): Promise<AdminUser> => {
  const res = await apiRequest<{ data: AdminUser }>("/api/usuarios/me", {
    method: "PATCH",
    body: input,
  });
  return res.data;
};

export const changeMyPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  await apiRequest("/api/usuarios/me/password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
  });
};

export const fetchMyAddresses = async (): Promise<MyAddress[]> => {
  const res = await apiRequest<{ data: MyAddress[] }>("/api/usuarios/me/direcciones");
  return res.data;
};

export const createMyAddress = async (input: AddressInput): Promise<MyAddress> => {
  const res = await apiRequest<{ data: MyAddress }>("/api/usuarios/me/direcciones", {
    method: "POST",
    body: input,
  });
  return res.data;
};

export const updateMyAddress = async (
  id: number,
  input: AddressInput
): Promise<MyAddress> => {
  const res = await apiRequest<{ data: MyAddress }>(`/api/usuarios/me/direcciones/${id}`, {
    method: "PUT",
    body: input,
  });
  return res.data;
};

export const deleteMyAddress = async (id: number): Promise<void> => {
  await apiRequest(`/api/usuarios/me/direcciones/${id}`, { method: "DELETE" });
};
