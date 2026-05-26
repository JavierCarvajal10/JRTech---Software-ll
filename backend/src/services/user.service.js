import {
  findAllUsers,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserRole,
  updateUserData,
  updateUserPasswordHash,
  findAddressesByUserId,
  findAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../repositories/auth.repository.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { ROLES } from "../config/roles.js";
import { validatePasswordStrength } from "../utils/password.js";

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  rol: user.rol,
  primerNombre: user.primerNombre,
  segundoNombre: user.segundoNombre,
  primerApellido: user.primerApellido,
  segundoApellido: user.segundoApellido,
  telefono: user.telefono,
  fechaCreacion: user.fechaCreacion,
});

export const listUsers = async (filter = {}) => {
  const users = await findAllUsers(filter);
  return users.map(publicUser);
};

export const promoteToAdmin = async (id) => {
  const user = await findUserById(id);
  if (!user) throw new Error("Usuario no encontrado");

  if (user.rol === ROLES.OWNER) {
    throw new Error("No puedes modificar el rol de un OWNER");
  }
  if (user.rol === ROLES.ADMIN) {
    return publicUser(user);
  }

  const updated = await updateUserRole(id, ROLES.ADMIN);
  return publicUser(updated);
};

export const demoteToCliente = async (id, requesterId) => {
  if (Number(id) === Number(requesterId)) {
    throw new Error("No puedes degradar tu propia cuenta");
  }

  const user = await findUserById(id);
  if (!user) throw new Error("Usuario no encontrado");

  if (user.rol === ROLES.OWNER) {
    throw new Error("No se puede degradar a un OWNER");
  }
  if (user.rol === ROLES.CLIENTE) {
    return publicUser(user);
  }

  const updated = await updateUserRole(id, ROLES.CLIENTE);
  return publicUser(updated);
};

export const updateProfile = async (userId, data) => {
  const allowed = ["primerNombre", "segundoNombre", "primerApellido", "segundoApellido", "telefono"];
  const updates = {};
  for (const key of allowed) {
    if (data[key] !== undefined) {
      const val = typeof data[key] === "string" ? data[key].trim() : data[key];
      updates[key] = val === "" ? null : val;
    }
  }

  if (updates.primerNombre === null) {
    throw new Error("El primer nombre no puede estar vacío");
  }
  if (updates.primerApellido === null) {
    throw new Error("El primer apellido no puede estar vacío");
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No hay cambios para guardar");
  }

  const updated = await updateUserData(userId, updates);
  return publicUser(updated);
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error("Debes ingresar tu contraseña actual y la nueva");
  }
  validatePasswordStrength(newPassword);
  if (currentPassword === newPassword) {
    throw new Error("La nueva contraseña debe ser diferente a la actual");
  }

  const user = await findUserById(userId);
  if (!user) throw new Error("Usuario no encontrado");

  const isValid = await comparePassword(currentPassword, user.contraseñaHash);
  if (!isValid) throw new Error("La contraseña actual es incorrecta");

  const hashed = await hashPassword(newPassword);
  await updateUserPasswordHash(userId, hashed);
  return { ok: true };
};

export const listMyAddresses = async (userId) => {
  return await findAddressesByUserId(userId);
};

export const addMyAddress = async (userId, data) => {
  const { direccion, ciudad, departamento, pais, codigoPostal } = data;
  if (!direccion?.trim()) {
    throw new Error("La dirección es obligatoria");
  }
  return await createAddress({
    usuarioId: Number(userId),
    direccion: direccion.trim(),
    ciudad: ciudad?.trim() || null,
    departamento: departamento?.trim() || null,
    pais: pais?.trim() || null,
    codigoPostal: codigoPostal?.trim() || null,
  });
};

export const updateMyAddress = async (userId, addressId, data) => {
  const existing = await findAddressById(addressId);
  if (!existing) throw new Error("Dirección no encontrada");
  if (existing.usuarioId !== Number(userId)) {
    throw new Error("No tienes permiso para modificar esta dirección");
  }

  const allowed = ["direccion", "ciudad", "departamento", "pais", "codigoPostal"];
  const updates = {};
  for (const key of allowed) {
    if (data[key] !== undefined) {
      const val = typeof data[key] === "string" ? data[key].trim() : data[key];
      updates[key] = val === "" ? null : val;
    }
  }
  if (updates.direccion === null) {
    throw new Error("La dirección no puede estar vacía");
  }
  if (Object.keys(updates).length === 0) {
    throw new Error("No hay cambios para guardar");
  }

  return await updateAddress(addressId, updates);
};

export const removeMyAddress = async (userId, addressId) => {
  const existing = await findAddressById(addressId);
  if (!existing) throw new Error("Dirección no encontrada");
  if (existing.usuarioId !== Number(userId)) {
    throw new Error("No tienes permiso para eliminar esta dirección");
  }
  return await deleteAddress(addressId);
};

export const createAdminUser = async (data) => {
  const { email, password, primerNombre, primerApellido } = data;

  if (!email || !password || !primerNombre || !primerApellido) {
    throw new Error("Email, contraseña, primer nombre y primer apellido son obligatorios");
  }
  validatePasswordStrength(password);

  const normalizedEmail = email.toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error("Ya existe un usuario con ese email");
  }

  const hashed = await hashPassword(password);

  const created = await createUser({
    email: normalizedEmail,
    contraseñaHash: hashed,
    primerNombre,
    primerApellido,
    rol: ROLES.ADMIN,
  });

  return publicUser(created);
};
