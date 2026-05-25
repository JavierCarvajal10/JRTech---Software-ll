import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import importRoutes from "./src/routes/import.routes.js";
import favoriteRoutes from "./src/routes/favorite.routes.js";
import { globalLimiter } from "./src/middleware/rateLimit.middleware.js";

const app = express();
const isProd = process.env.NODE_ENV === "production";

// Trust proxy: necesario en Render/Vercel/Heroku para que rate-limit y cookies
// detecten el IP/protocolo reales (vienen detrás de un proxy).
app.set("trust proxy", 1);

// Headers de seguridad estándar (XSS, clickjacking, MIME sniffing, etc.).
app.use(helmet());

// CORS estricto: solo el frontend autorizado, con credenciales (cookies).
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Permitir requests sin origin (curl, healthchecks, server-to-server).
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin no permitido: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Body parsing con límite explícito para evitar payloads gigantes.
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// Rate limit global como red de seguridad.
app.use(globalLimiter);

app.get("/", (_req, res) => {
  res.send("Backend funcionando");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api/ordenes", orderRoutes);
app.use("/api/importaciones", importRoutes);
app.use("/api/productos", productRoutes);
app.use("/api/categorias", categoryRoutes);
app.use("/api/favoritos", favoriteRoutes);
app.use("/api/", chatRoutes);

// Sanitizador final de errores: en producción nunca exponemos detalles internos.
// Captura tanto errores de CORS como cualquier throw que escape de los handlers.
app.use((err, _req, res, _next) => {
  if (err?.message?.startsWith("Origin no permitido")) {
    return res.status(403).json({ message: "Origin no permitido por CORS" });
  }
  if (!isProd) {
    console.error("[error]", err);
    return res.status(err.status || 500).json({ message: err.message });
  }
  // En prod logueamos pero al cliente solo devolvemos un mensaje genérico.
  console.error("[error]", err);
  res.status(err.status || 500).json({ message: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
