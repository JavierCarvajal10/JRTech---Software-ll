import {
  findAllProducts,
  findProductById,
  findProductsBySubcategoriaName,
  createProduct as createProductRepo,
  updateProduct as updateProductRepo,
  deleteProduct as deleteProductRepo,
  setBajoImportacion as setBajoImportacionRepo,
} from "../repositories/product.repository.js";
import { indexProductEmbedding } from "./embedding.service.js";

const validateImageUrls = (urls) => {
  if (!Array.isArray(urls)) return [];
  return urls.map((url, idx) => {
    if (typeof url !== "string" || !url.trim()) {
      throw new Error(`URL de imagen inválida en la posición ${idx}`);
    }
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error(`URL de imagen mal formada en la posición ${idx}: ${url}`);
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(
        `Protocolo no permitido para imágenes (solo http/https): ${parsed.protocol}`
      );
    }
    return url.trim();
  });
};

const parseBool = (v) => v === true || v === "true" || v === "1";

export const getProducts = async (filters = {}) => {
  const includeOutOfStock = parseBool(filters.includeOutOfStock);
  // Admin puede pedir que también aparezcan productos bajoImportacion en el
  // listado general (para gestionarlos desde AdminProducts).
  const includeImports = parseBool(filters.includeImports);

  let bajoImportacion;
  if (filters.bajoImportacion === "true" || filters.bajoImportacion === true) {
    bajoImportacion = true;
  } else if (filters.bajoImportacion === "false" || filters.bajoImportacion === false) {
    bajoImportacion = false;
  }

  return await findAllProducts({
    ...filters,
    includeOutOfStock,
    includeImports,
    bajoImportacion,
  });
};

export const getProductsBySubcategoria = async (nombre) => {
  if (!nombre?.trim()) throw new Error("Subcategoría requerida");
  return await findProductsBySubcategoriaName(nombre.trim());
};

export const setProductoBajoImportacion = async (id, value) => {
  await getProductById(id);
  const updated = await setBajoImportacionRepo(id, value);
  // Re-indexar embedding porque el contexto (incluido el flag) puede cambiar
  // la presencia del producto en búsquedas.
  indexProductEmbedding(updated.id).catch((e) =>
    console.warn("[rag] async indexing failed:", e.message)
  );
  return updated;
};

export const getProductById = async (id) => {
  const product = await findProductById(id);
  if (!product) throw new Error("Producto no encontrado");
  return product;
};

export const createProduct = async (data) => {
  const { nombre, precio, stock } = data;

  if (!nombre || precio === undefined || precio === null) {
    throw new Error("Los campos 'nombre' y 'precio' son obligatorios");
  }

  const precioNumber = Number(precio);
  if (Number.isNaN(precioNumber) || precioNumber < 0) {
    throw new Error("El precio debe ser un número válido y no negativo");
  }

  const stockNumber = stock === undefined ? 0 : Number(stock);
  if (Number.isNaN(stockNumber) || stockNumber < 0) {
    throw new Error("El stock debe ser un número válido y no negativo");
  }

  const created = await createProductRepo({
    nombre: data.nombre,
    descripcion: data.descripcion ?? null,
    precio: precioNumber,
    stock: stockNumber,
    categoriaId: data.categoriaId ? Number(data.categoriaId) : null,
    tipo: data.tipo ?? null,
    bajoImportacion: parseBool(data.bajoImportacion),
    imagenes: validateImageUrls(data.imagenes),
    especificaciones: Array.isArray(data.especificaciones)
      ? data.especificaciones
      : [],
  });

  indexProductEmbedding(created.id).catch((e) =>
    console.warn("[rag] async indexing failed:", e.message)
  );

  return created;
};

export const updateProduct = async (id, data) => {
  await getProductById(id);

  const payload = {};
  if (data.nombre !== undefined) payload.nombre = data.nombre;
  if (data.descripcion !== undefined) payload.descripcion = data.descripcion;
  if (data.precio !== undefined) payload.precio = Number(data.precio);
  if (data.stock !== undefined) payload.stock = Number(data.stock);
  if (data.categoriaId !== undefined)
    payload.categoriaId = data.categoriaId ? Number(data.categoriaId) : null;
  if (data.tipo !== undefined) payload.tipo = data.tipo;
  if (data.bajoImportacion !== undefined)
    payload.bajoImportacion = parseBool(data.bajoImportacion);
  if (data.imagenes !== undefined) payload.imagenes = validateImageUrls(data.imagenes);
  if (data.especificaciones !== undefined)
    payload.especificaciones = data.especificaciones;

  const updated = await updateProductRepo(id, payload);

  indexProductEmbedding(updated.id).catch((e) =>
    console.warn("[rag] async indexing failed:", e.message)
  );

  return updated;
};

export const deleteProduct = async (id) => {
  await getProductById(id);
  return await deleteProductRepo(id);
};
