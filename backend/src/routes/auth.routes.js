import express from "express";
import {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPasswordHandler,
} from "../controllers/auth.controller.js";
import {
  loginLimiter,
  forgotPasswordLimiter,
} from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/register", loginLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", me);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", forgotPasswordLimiter, resetPasswordHandler);

export default router;
