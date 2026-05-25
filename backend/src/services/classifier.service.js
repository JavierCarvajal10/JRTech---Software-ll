export async function clasificar(mensaje) {
  const res = await fetch("http://localhost:1234/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "local-model",
      messages: [
        {
          role: "system",
          content: `
Clasifica el mensaje del usuario.

Responde SOLO JSON:

{
  "tipo": "chat" | "producto"
}
`
        },
        { role: "user", content: mensaje }
      ],
      temperature: 0
    })
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";

  const json = raw.substring(raw.indexOf("{"), raw.lastIndexOf("}") + 1);

  try {
    return JSON.parse(json);
  } catch {
    return { tipo: "chat" };
  }
}