import express from "express";
import {
  list,
  promote,
  demote,
  createAdmin,
  updateMe,
  changeMyPassword,
  myAddresses,
  createMyAddress,
  updateMyAddressById,
  deleteMyAddress,
} from "../controllers/user.controller.js";
import { requireAuth, requireOwner, requireRole } from "../middleware/auth.middleware.js";
import { ROLES } from "../config/roles.js";

const router = express.Router();

// Mi perfil (cualquier usuario autenticado)
router.patch("/me", requireAuth, updateMe);
router.patch("/me/password", requireAuth, changeMyPassword);
router.get("/me/direcciones", requireAuth, myAddresses);
router.post("/me/direcciones", requireAuth, createMyAddress);
router.put("/me/direcciones/:id", requireAuth, updateMyAddressById);
router.delete("/me/direcciones/:id", requireAuth, deleteMyAddress);

// Listar: ADMIN y OWNER pueden ver la lista
router.get("/", requireAuth, requireRole(ROLES.ADMIN), list);

// Mutaciones de roles: solo OWNER
router.post("/", requireAuth, requireOwner, createAdmin);
router.patch("/:id/promote", requireAuth, requireOwner, promote);
router.patch("/:id/demote", requireAuth, requireOwner, demote);

export default router;
