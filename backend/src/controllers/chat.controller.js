import { clasificar } from "../services/classifier.service.js";
import { responderChat } from "../services/chat.service.js";
import { buscarProductos } from "../services/product.service.js";
import { parsearMensaje } from "../services/parser.service.js";

export async function chatController(req, res) {
  const { message } = req.body;

  const { tipo } = await clasificar(message);

  // CASO 1: CHAT NORMAL
  if (tipo === "chat") {
    const respuesta = await responderChat(message);

    return res.json({
      tipo: "chat",
      respuesta,
      productos: []
    });
  }

  // CASO 2: PRODUCTOS
  if (tipo === "producto") {
    const filtros = await parsearMensaje(message);

    const productos = await buscarProductos(filtros);

    return res.json({
      tipo: "producto",
      respuesta: "Te encontré estas opciones ",
      productos
    });
  }
}