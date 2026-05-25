import express from "express";
import {
  list,
  getById,
  myOrders,
  create,
  updateStatus,
} from "../controllers/order.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { orderCreateLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

// Crear orden: público (guest checkout). Si hay token válido, se linkea al usuario.
router.post("/", orderCreateLimiter, create);

// Mis órdenes: requiere login
router.get("/mis", requireAuth, myOrders);

// Admin: listar todas y cambiar estado
router.get("/", requireAuth, requireAdmin, list);
router.get("/:id", requireAuth, requireAdmin, getById);
router.patch("/:id/estado", requireAuth, requireAdmin, updateStatus);

export default router;
