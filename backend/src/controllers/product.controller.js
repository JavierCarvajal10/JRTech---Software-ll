import {
  getProducts,
  getProductById,
  getProductsBySubcategoria,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductoBajoImportacion,
} from "../services/product.service.js";

export const getAll = async (req, res) => {
  try {
    const products = await getProducts(req.query);
    res.status(200).json({ data: products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    res.status(200).json({ data: product });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const product = await createProduct(req.body);
    res.status(201).json({
      message: "Producto creado correctamente",
      data: product,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    res.status(200).json({
      message: "Producto actualizado correctamente",
      data: product,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBySubcategoria = async (req, res) => {
  try {
    const { nombre } = req.params;
    const products = await getProductsBySubcategoria(nombre);
    res.status(200).json({ data: products });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateBajoImportacion = async (req, res) => {
  try {
    const product = await setProductoBajoImportacion(
      req.params.id,
      req.body?.bajoImportacion
    );
    res.status(200).json({
      message: "Estado de importación actualizado",
      data: product,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
