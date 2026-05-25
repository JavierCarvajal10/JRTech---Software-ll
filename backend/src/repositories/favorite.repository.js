import db from "../config/database.js";

const favoriteProductInclude = {
  producto: {
    include: {
      categoria: { include: { categoriaPadre: true } },
      imagenes: true,
      especificaciones: true,
    },
  },
};

export const findFavoritesByUserId = async (usuarioId) => {
  return await db.favorito.findMany({
    where: { usuarioId: Number(usuarioId) },
    include: favoriteProductInclude,
    orderBy: { fechaCreacion: "desc" },
  });
};

export const findFavoriteIdsByUserId = async (usuarioId) => {
  const rows = await db.favorito.findMany({
    where: { usuarioId: Number(usuarioId) },
    select: { productoId: true },
  });
  return rows.map((r) => r.productoId);
};

export const createFavorite = async (usuarioId, productoId) => {
  return await db.favorito.create({
    data: {
      usuarioId: Number(usuarioId),
      productoId: Number(productoId),
    },
    include: favoriteProductInclude,
  });
};

export const deleteFavorite = async (usuarioId, productoId) => {
  return await db.favorito.deleteMany({
    where: {
      usuarioId: Number(usuarioId),
      productoId: Number(productoId),
    },
  });
};

export const findFavorite = async (usuarioId, productoId) => {
  return await db.favorito.findUnique({
    where: {
      usuarioId_productoId: {
        usuarioId: Number(usuarioId),
        productoId: Number(productoId),
      },
    },
  });
};
