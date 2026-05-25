import { apiRequest } from "./client";
import { mapProduct, type BackendProducto, type Product } from "./products";

interface BackendFavorito {
  id: number;
  productoId: number;
  fechaCreacion: string;
  producto: BackendProducto;
}

export interface Favorite {
  id: number;
  productId: number;
  createdAt: string;
  product: Product;
}

const mapFavorite = (f: BackendFavorito): Favorite => ({
  id: f.id,
  productId: f.productoId,
  createdAt: f.fechaCreacion,
  product: mapProduct(f.producto),
});

export const fetchFavorites = async (): Promise<Favorite[]> => {
  const res = await apiRequest<{ data: BackendFavorito[] }>("/api/favoritos");
  return res.data.map(mapFavorite);
};

export const fetchFavoriteIds = async (): Promise<number[]> => {
  const res = await apiRequest<{ data: number[] }>("/api/favoritos/ids");
  return res.data;
};

export const addFavorite = async (productId: number): Promise<void> => {
  await apiRequest("/api/favoritos", {
    method: "POST",
    body: { productoId: productId },
  });
};

export const removeFavorite = async (productId: number): Promise<void> => {
  await apiRequest(`/api/favoritos/${productId}`, { method: "DELETE" });
};
