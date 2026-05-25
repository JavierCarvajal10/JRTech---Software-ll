import db from "../config/database.js";

export const findUserByEmail = async (email) => {
  return await db.usuario.findUnique({
    where: { email },
  });
};

export const findUserById = async (id) => {
  return await db.usuario.findUnique({
    where: { id: Number(id) },
  });
};

export const createUser = async (data) => {
  return await db.usuario.create({ data });
};

export const updateUserRole = async (id, rol) => {
  return await db.usuario.update({
    where: { id: Number(id) },
    data: { rol },
  });
};

export const updateUserData = async (id, data) => {
  return await db.usuario.update({
    where: { id: Number(id) },
    data,
  });
};

export const updateUserPasswordHash = async (id, hash) => {
  return await db.usuario.update({
    where: { id: Number(id) },
    data: { contraseñaHash: hash },
  });
};

export const findAddressesByUserId = async (usuarioId) => {
  return await db.direccion.findMany({
    where: { usuarioId: Number(usuarioId) },
    orderBy: { id: "asc" },
  });
};

export const findAddressById = async (id) => {
  return await db.direccion.findUnique({
    where: { id: Number(id) },
  });
};

export const createAddress = async (data) => {
  return await db.direccion.create({ data });
};

export const updateAddress = async (id, data) => {
  return await db.direccion.update({
    where: { id: Number(id) },
    data,
  });
};

export const deleteAddress = async (id) => {
  return await db.direccion.delete({
    where: { id: Number(id) },
  });
};

export const setResetPasswordToken = async (userId, tokenHash, expiresAt) => {
  return await db.usuario.update({
    where: { id: Number(userId) },
    data: {
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: expiresAt,
    },
  });
};

export const findUserByResetTokenHash = async (tokenHash) => {
  return await db.usuario.findFirst({
    where: {
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { gt: new Date() },
    },
  });
};

export const clearResetPasswordToken = async (userId, newPasswordHash) => {
  return await db.usuario.update({
    where: { id: Number(userId) },
    data: {
      contraseñaHash: newPasswordHash,
      resetPasswordTokenHash: null,
      resetPasswordExpires: null,
    },
  });
};

export const findAllUsers = async ({ rol } = {}) => {
  return await db.usuario.findMany({
    where: rol ? { rol } : undefined,
    orderBy: { fechaCreacion: "desc" },
    select: {
      id: true,
      email: true,
      rol: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
      telefono: true,
      fechaCreacion: true,
    },
  });
};
