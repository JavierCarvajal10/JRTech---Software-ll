import { apiRequest } from "./client";
import type { BackendCategoria } from "./products";

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  parentName: string | null;
}

const mapCategory = (c: BackendCategoria): Category => ({
  id: c.id,
  name: c.nombre,
  parentId: c.categoriaPadreId,
  parentName: c.categoriaPadre?.nombre ?? null,
});

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await apiRequest<{ data: BackendCategoria[] }>("/api/categorias");
  return res.data.map(mapCategory);
};

export interface CategoryInput {
  nombre: string;
  categoriaPadreId?: number | null;
}

export const createCategory = async (input: CategoryInput): Promise<Category> => {
  const res = await apiRequest<{ data: BackendCategoria }>("/api/categorias", {
    method: "POST",
    body: input,
  });
  return mapCategory(res.data);
};

export interface CategoryTreeNode {
  parent: Category;
  subcategories: Category[];
}

export const buildCategoryTree = (categories: Category[]): CategoryTreeNode[] => {
  const parents = categories.filter((c) => c.parentId === null);
  return parents
    .map((parent) => ({
      parent,
      subcategories: categories.filter((c) => c.parentId === parent.id),
    }))
    .sort((a, b) => a.parent.name.localeCompare(b.parent.name));
};
