import { llm } from "./llm.service.js";

export async function generateResponse(message, products) {
  const context = products.map(p => `
Producto: ${p.nombre}
Precio: ${p.precio}
Descripción: ${p.descripcion}
`).join("\n");

  const prompt = `
Eres un asistente de tecnología.

REGLAS:
- SOLO hablas de tecnología
- Si preguntan algo fuera de tecnología:
"Solo vendo productos de tecnología"

Usuario: "${message}"

Productos:
${context}
`;

  return await llm(prompt);
}