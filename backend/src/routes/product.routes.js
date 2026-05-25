import express from "express";
import {
  getAll,
  getById,
  getBySubcategoria,
  create,
  update,
  remove,
  updateBajoImportacion,
} from "../controllers/product.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAll);
// Lista productos por nombre de subcategoría — usado por el PC Builder
// para traer "Procesadores", "GPU Gráficas", etc.
router.get("/subcategoria/:nombre", getBySubcategoria);
router.get("/:id", getById);

router.post("/", requireAuth, requireAdmin, create);
router.put("/:id", requireAuth, requireAdmin, update);
router.patch(
  "/:id/bajo-importacion",
  requireAuth,
  requireAdmin,
  updateBajoImportacion
);
router.delete("/:id", requireAuth, requireAdmin, remove);

export default router;
