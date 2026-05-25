export async function responderChat(mensaje) {
  const res = await fetch("http://localhost:1234/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "local-model",
      messages: [
        {
          role: "system",
         content: `
Eres un asistente de ecommerce de tecnología en Colombia.

REGLAS ESTRICTAS:
- NO expliques lo que haces
- NO describas el proceso
- NO uses frases como:
  "Para responder..."
  "Esta instrucción..."
  "Lo que se debe hacer..."
- NO pienses en voz alta
- SOLO escribe la respuesta final

SI NO CUMPLES ESTO, LA RESPUESTA ES INCORRECTA.

---

EJEMPLOS:

Usuario: hola
Respuesta: Hola!  ¿Cómo estás?

Usuario: bien
Respuesta: ¡Qué bueno!  ¿Buscas algún producto?

Usuario: gracias
Respuesta: ¡Con gusto! 

---

Responde SIEMPRE en español.
`
        },
        { role: "user", content: mensaje }
      ],
      temperature: 0.1,      // Bajo
      max_tokens: 100,       // Clave: limita respuesta
      top_p: 0.85
    })
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "🤖";
}