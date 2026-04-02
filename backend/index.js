const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Backend funcionando en ");
});

app.listen(3000, () => {
  console.log("Servidor en puerto 3000 "  + "http://localhost:3000/");
});