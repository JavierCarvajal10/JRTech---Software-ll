import {
  findAllCategories,
  createCategory as createCategoryRepo,
} from "../repositories/category.repository.js";

export const getCategories = async () => {
  return await findAllCategories();
};

export const createCategory = async (data) => {
  if (!data?.nombre) throw new Error("El nombre de la categoría es obligatorio");
  return await createCategoryRepo({
    nombre: data.nombre,
    categoriaPadreId: data.categoriaPadreId
      ? Number(data.categoriaPadreId)
      : null,
  });
};
