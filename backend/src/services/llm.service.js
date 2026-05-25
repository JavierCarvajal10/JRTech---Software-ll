export async function llm(prompt, contexto = {}) {
  const response = await fetch("http://localhost:1234/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "local-model",
      messages: [
        {
          role: "system",
          content: `
Eres un asistente de un ecommerce de tecnología en Colombia.

Responde SIEMPRE en JSON válido con este formato:

{
  "tipo": "chat | producto",
  "respuesta": "mensaje final para el usuario",
  "productos": []
}

REGLAS:
- SOLO devuelve JSON
- NO expliques nada
- NO agregues texto fuera del JSON
- NO incluyas razonamientos
- SIEMPRE responde en español
- "respuesta" debe ser natural, como hablar con un cliente

Ejemplo:

Usuario: hola  
Respuesta:
{
  "tipo": "chat",
  "respuesta": "Hola! ¿Cómo estás? 👋",
  "productos": []
}
`
//           content: `
// Eres un asistente de un ecommerce de tecnología en Colombia.

// Tu tarea es analizar el mensaje del usuario y responder SOLO en JSON.

// Puedes hacer DOS cosas:

// 1. Si tienes suficiente información → tipo: "resultado"
// 2. Si falta información → tipo: "pregunta"

// ---

// REGLAS:
// - NO expliques nada
// - NO recomiendes productos
// - SOLO JSON válido

// ---

// CONTEXTO ACTUAL:
// ${JSON.stringify(contexto)}

// ---

// INTERPRETACIÓN DE DINERO:
// - palo, palos, melón, millones = 1,000,000
// - lucas = 1,000
// - k = 1,000

// ---

// INTENCIÓN:
// - jugar → gaming
// - estudiar → estudio
// - trabajar → trabajo

// ---

// CATEGORÍAS:
// - pc, computador, laptop → computador
// - celular → celular
// - tablet → tablet

// ---

// REGLAS DE DECISIÓN:
// - Si habla de computador y NO dice si es portátil o escritorio → PREGUNTA
// - Si falta información clave → PREGUNTA

// ---

// FORMATO:

// Si falta info:
// {
//   "tipo": "pregunta",
//   "pregunta": "texto",
//   "data": {
//     "categoria": "...",
//     "precio_max": number | null,
//     "uso": "...",
//     "tipo_pc": "portatil | escritorio | null"
//   }
// }

// Si está completo:
// {
//   "tipo": "resultado",
//   "pregunta": null,
//   "data": {
//     "categoria": "...",
//     "precio_max": number | null,
//     "uso": "...",
//     "tipo_pc": "portatil | escritorio | null"
//   }
// }
// `
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1
    })
  });

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "";

  const json = raw.substring(raw.indexOf("{"), raw.lastIndexOf("}") + 1);

  try {
    return JSON.parse(json);
  } catch (error) {
    console.error("Error parseando JSON:", raw);
    return {
      tipo: "pregunta",
      pregunta: "¿Puedes darme más detalles?",
      data: contexto
    };
  }
}