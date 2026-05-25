import db from "../config/database.js";

export const findAllCategories = async () => {
  return await db.categoria.findMany({
    include: { categoriaPadre: true },
    orderBy: { nombre: "asc" },
  });
};

export const createCategory = async (data) => {
  return await db.categoria.create({ data });
};
