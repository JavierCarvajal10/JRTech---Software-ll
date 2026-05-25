import {
  getCategories,
  createCategory,
} from "../services/category.service.js";

export const getAll = async (req, res) => {
  try {
    const categories = await getCategories();
    res.status(200).json({ data: categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const category = await createCategory(req.body);
    res.status(201).json({
      message: "Categoría creada correctamente",
      data: category,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
