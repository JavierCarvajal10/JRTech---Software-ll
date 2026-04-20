import express from "express";
import { registerUser } from "../services/auth.service.js";
import { login } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      message: "Usuario creado correctamente",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.post("/login", login)

export default router;