import db from "../config/database.js";

const productInclude = {
  categoria: {
    include: { categoriaPadre: true },
  },
  imagenes: true,
  especificaciones: true,
};

export const findAllProducts = async (filters = {}) => {
  const where = {};

  if (filters.categoriaId) {
    where.categoriaId = Number(filters.categoriaId);
  }

  if (filters.search) {
    where.nombre = { contains: filters.search, mode: "insensitive" };
  }

  // Reglas de visibilidad por defecto:
  // - El catálogo general NO muestra productos bajoImportacion (solo viven
  //   en la sección "Arma tu PC" vía /subcategoria/:nombre).
  // - El admin SÍ los puede pedir explícitamente con
  //   ?includeImports=true (ej: AdminProducts con includeOutOfStock=true).
  if (filters.bajoImportacion === true) {
    // El caller los quiere SÍ o SÍ (filtro inverso explícito).
    where.bajoImportacion = true;
  } else if (filters.bajoImportacion === false) {
    where.bajoImportacion = false;
  } else if (!filters.includeImports) {
    // Default: ocultar bajoImportacion del catálogo público.
    where.bajoImportacion = false;
  }

  // Por defecto también ocultamos productos agotados.
  if (!filters.includeOutOfStock) {
    where.stock = { gt: 0 };
  }

  return await db.producto.findMany({
    where,
    include: productInclude,
    orderBy: { id: "desc" },
  });
};

export const findProductsBySubcategoriaName = async (nombreSubcategoria) => {
  const sub = await db.categoria.findFirst({
    where: { nombre: nombreSubcategoria },
  });
  if (!sub) return [];

  return await db.producto.findMany({
    where: {
      categoriaId: sub.id,
      OR: [{ stock: { gt: 0 } }, { bajoImportacion: true }],
    },
    include: productInclude,
    orderBy: [{ bajoImportacion: "asc" }, { precio: "asc" }],
  });
};

export const setBajoImportacion = async (id, value) => {
  return await db.producto.update({
    where: { id: Number(id) },
    data: { bajoImportacion: Boolean(value) },
    include: productInclude,
  });
};

export const findProductById = async (id) => {
  return await db.producto.findUnique({
    where: { id: Number(id) },
    include: productInclude,
  });
};

export const createProduct = async (data) => {
  const { imagenes = [], especificaciones = [], ...rest } = data;

  return await db.producto.create({
    data: {
      ...rest,
      imagenes: imagenes.length
        ? { create: imagenes.map((url) => ({ url })) }
        : undefined,
      especificaciones: especificaciones.length
        ? { create: especificaciones }
        : undefined,
    },
    include: productInclude,
  });
};

export const updateProduct = async (id, data) => {
  const { imagenes, especificaciones, ...rest } = data;

  return await db.producto.update({
    where: { id: Number(id) },
    data: {
      ...rest,
      ...(imagenes
        ? {
            imagenes: {
              deleteMany: {},
              create: imagenes.map((url) => ({ url })),
            },
          }
        : {}),
      ...(especificaciones
        ? {
            especificaciones: {
              deleteMany: {},
              create: especificaciones,
            },
          }
        : {}),
    },
    include: productInclude,
  });
};

export const deleteProduct = async (id) => {
  return await db.producto.delete({
    where: { id: Number(id) },
  });
};
