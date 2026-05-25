import {
  findFavoritesByUserId,
  findFavoriteIdsByUserId,
  createFavorite,
  deleteFavorite,
  findFavorite,
} from "../repositories/favorite.repository.js";
import { findProductById } from "../repositories/product.repository.js";

export const listMyFavorites = async (userId) => {
  const favorites = await findFavoritesByUserId(userId);
  return favorites.map((f) => ({
    id: f.id,
    productoId: f.productoId,
    fechaCreacion: f.fechaCreacion,
    producto: f.producto,
  }));
};

export const listMyFavoriteIds = async (userId) => {
  return await findFavoriteIdsByUserId(userId);
};

export const addFavorite = async (userId, productoId) => {
  const productId = Number(productoId);
  if (!productId || Number.isNaN(productId)) {
    throw new Error("ID de producto inválido");
  }

  const product = await findProductById(productId);
  if (!product) throw new Error("Producto no encontrado");

  const existing = await findFavorite(userId, productId);
  if (existing) {
    return existing;
  }

  return await createFavorite(userId, productId);
};

export const removeFavorite = async (userId, productoId) => {
  const productId = Number(productoId);
  if (!productId || Number.isNaN(productId)) {
    throw new Error("ID de producto inválido");
  }
  await deleteFavorite(userId, productId);
};
