import {
  listMyFavorites,
  listMyFavoriteIds,
  addFavorite,
  removeFavorite,
} from "../services/favorite.service.js";

export const getMyFavorites = async (req, res) => {
  try {
    const data = await listMyFavorites(req.user.id);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyFavoriteIds = async (req, res) => {
  try {
    const data = await listMyFavoriteIds(req.user.id);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMyFavorite = async (req, res) => {
  try {
    const productoId = req.body?.productoId ?? req.params?.productoId;
    const data = await addFavorite(req.user.id, productoId);
    res.status(201).json({ message: "Producto agregado a favoritos", data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMyFavorite = async (req, res) => {
  try {
    await removeFavorite(req.user.id, req.params.productoId);
    res.status(200).json({ message: "Producto eliminado de favoritos" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
