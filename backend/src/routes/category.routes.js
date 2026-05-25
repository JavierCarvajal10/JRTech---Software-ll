import express from "express";
import { getAll, create } from "../controllers/category.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAll);
router.post("/", requireAuth, requireAdmin, create);

export default router;
