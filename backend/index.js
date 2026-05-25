import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./src/routes/auth.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import favoriteRoutes from "./src/routes/favorite.routes.js";
import importRoutes from "./src/routes/import.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";

const app = express();

// Detrás del proxy de Render: necesario para que las cookies "secure" funcionen.
app.set("trust proxy", 1);

// Orígenes permitidos. En producción define FRONTEND_URL en Render
// (ej: https://jerotech.vercel.app). Se admiten varios separados por coma.
const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Permite peticiones sin origin (Postman, curl, same-origin).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin no permitido por CORS: ${origin}`));
    },
    credentials: true, // necesario para enviar/recibir la cookie httpOnly
  })
);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Backend funcionando");
});

app.use("/api/auth", authRoutes);
app.use("/api/categorias", categoryRoutes);
app.use("/api/productos", productRoutes);
app.use("/api/favoritos", favoriteRoutes);
app.use("/api/importaciones", importRoutes);
app.use("/api/ordenes", orderRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api", chatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
