import express from "express";
import {
  getMyFavorites,
  getMyFavoriteIds,
  addMyFavorite,
  deleteMyFavorite,
} from "../controllers/favorite.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, getMyFavorites);
router.get("/ids", requireAuth, getMyFavoriteIds);
router.post("/", requireAuth, addMyFavorite);
router.delete("/:productoId", requireAuth, deleteMyFavorite);

export default router;
