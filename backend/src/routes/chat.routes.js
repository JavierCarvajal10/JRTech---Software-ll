

import { Router } from "express";
import { chatController } from "../controllers/chat.controller2.js";
import { chatLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();
router.use(chatLimiter);

/**
 * POST /chat
 * 
 * Recibe:
 * {
 *   "message": "Hola",
 *   "conversationId": "conv_123" (opcional)
 * }
 * 
 * Retorna:
 * {
 *   "conversationId": "conv_123",
 *   "tipo": "chat",
 *   "respuesta": "¡Hola!",
 *   "productos": [],
 *   "contexto": "...",
 *   "timestamp": "..."
 * }
 */
router.post("/chat", chatController);

export default router;
