import db from "../config/database.js";

const importInclude = {
  productoRef: {
    include: {
      categoria: { include: { categoriaPadre: true } },
      imagenes: { take: 1 },
    },
  },
};

export const findAllImports = async ({ estado } = {}) => {
  return await db.importacion.findMany({
    where: estado ? { estado } : undefined,
    include: importInclude,
    orderBy: { fechaCreacion: "desc" },
  });
};

export const findImportById = async (id) => {
  return await db.importacion.findUnique({
    where: { id: Number(id) },
    include: importInclude,
  });
};

export const createImport = async (data) => {
  return await db.importacion.create({ data, include: importInclude });
};

export const createImportsBulk = async (records) => {
  // Prisma no soporta returning con createMany para Postgres en algunos casos;
  // hacemos una transacción de creates individuales para devolver los registros completos.
  return await db.$transaction(
    records.map((r) =>
      db.importacion.create({ data: r, include: importInclude })
    )
  );
};

export const updateImportStatus = async (id, estado) => {
  return await db.importacion.update({
    where: { id: Number(id) },
    data: { estado },
  });
};

export const deleteImport = async (id) => {
  return await db.importacion.delete({
    where: { id: Number(id) },
  });
};
