import authRoutes from "./src/routes/auth.routes.js";
import express from "express"

const app = express();

app.get("/", (req, res) => {
  res.send("Backend funcionando en ");
});

app.use(express.json());

app.use("/api/auth", authRoutes);


app.listen(3000, () => {
  console.log("Servidor en puerto 3000 "  + "http://localhost:3000/");
});