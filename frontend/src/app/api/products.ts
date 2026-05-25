import { apiRequest } from "./client";

export interface BackendImagen {
  id: number;
  productoId: number;
  url: string;
}

export interface BackendEspecificacion {
  id: number;
  productoId: number;
  clave: string;
  valor: string;
}

export interface BackendCategoria {
  id: number;
  nombre: string;
  categoriaPadreId: number | null;
  categoriaPadre?: BackendCategoria | null;
}

export interface BackendProducto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: string | number;
  stock: number;
  categoriaId: number | null;
  tipo: string | null;
  bajoImportacion?: boolean;
  fechaCreacion: string;
  imagenes: BackendImagen[];
  especificaciones: BackendEspecificacion[];
  categoria: BackendCategoria | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  categoryId: number | null;
  categoryParent: string | null;
  categoryParentId: number | null;
  type: string | null;
  price: number;
  stock: number;
  bajoImportacion: boolean;
  image: string;
  images: string[];
  hasImage: boolean;
  specifications: { label: string; value: string }[];
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80";

export const mapProduct = (p: BackendProducto): Product => {
  const parent = p.categoria?.categoriaPadre ?? null;
  const hasImage = p.imagenes.length > 0;
  return {
    id: p.id,
    name: p.nombre,
    description: p.descripcion ?? "",
    category: p.categoria?.nombre ?? "Sin categoría",
    categoryId: p.categoriaId,
    categoryParent: parent?.nombre ?? null,
    categoryParentId: parent?.id ?? null,
    type: p.tipo,
    price: Number(p.precio),
    stock: p.stock,
    bajoImportacion: Boolean(p.bajoImportacion),
    image: p.imagenes[0]?.url ?? FALLBACK_IMAGE,
    images: hasImage ? p.imagenes.map((i) => i.url) : [FALLBACK_IMAGE],
    hasImage,
    specifications: p.especificaciones.map((e) => ({
      label: e.clave,
      value: e.valor,
    })),
  };
};

export interface ProductInput {
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  categoriaId?: number | null;
  tipo?: string | null;
  bajoImportacion?: boolean;
  imagenes?: string[];
  especificaciones?: { clave: string; valor: string }[];
}

export interface FetchProductsOptions {
  includeOutOfStock?: boolean;
  includeImports?: boolean;
}

export const fetchProducts = async (
  options: FetchProductsOptions = {}
): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (options.includeOutOfStock) params.set("includeOutOfStock", "true");
  if (options.includeImports) params.set("includeImports", "true");
  const qs = params.toString();
  const url = qs ? `/api/productos?${qs}` : "/api/productos";
  const res = await apiRequest<{ data: BackendProducto[] }>(url);
  return res.data.map(mapProduct);
};

export const fetchProductById = async (id: number | string): Promise<Product> => {
  const res = await apiRequest<{ data: BackendProducto }>(
    `/api/productos/${id}`
  );
  return mapProduct(res.data);
};

export const createProduct = async (input: ProductInput): Promise<Product> => {
  const res = await apiRequest<{ data: BackendProducto }>("/api/productos", {
    method: "POST",
    body: input,
  });
  return mapProduct(res.data);
};

export const updateProduct = async (
  id: number,
  input: Partial<ProductInput>
): Promise<Product> => {
  const res = await apiRequest<{ data: BackendProducto }>(
    `/api/productos/${id}`,
    {
      method: "PUT",
      body: input,
    }
  );
  return mapProduct(res.data);
};

export const deleteProduct = async (id: number): Promise<void> => {
  await apiRequest(`/api/productos/${id}`, { method: "DELETE" });
};

export const fetchProductsBySubcategoria = async (
  nombre: string
): Promise<Product[]> => {
  const res = await apiRequest<{ data: BackendProducto[] }>(
    `/api/productos/subcategoria/${encodeURIComponent(nombre)}`
  );
  return res.data.map(mapProduct);
};

export const setProductBajoImportacion = async (
  id: number,
  bajoImportacion: boolean
): Promise<Product> => {
  const res = await apiRequest<{ data: BackendProducto }>(
    `/api/productos/${id}/bajo-importacion`,
    {
      method: "PATCH",
      body: { bajoImportacion },
    }
  );
  return mapProduct(res.data);
};
