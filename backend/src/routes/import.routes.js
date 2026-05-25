import express from "express";
import {
  list,
  getById,
  submit,
  submitFromBuilder,
  updateStatus,
  remove,
} from "../controllers/import.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { importSubmitLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

// Pública: cualquiera puede enviar una solicitud de importación (con rate limit)
router.post("/", importSubmitLimiter, submit);

// Pública: solicitud desde el PC Builder (lista de productoIds + datos contacto)
router.post("/from-builder", importSubmitLimiter, submitFromBuilder);

// Admin: gestión
router.get("/", requireAuth, requireAdmin, list);
router.get("/:id", requireAuth, requireAdmin, getById);
router.patch("/:id/estado", requireAuth, requireAdmin, updateStatus);
router.delete("/:id", requireAuth, requireAdmin, remove);

export default router;
