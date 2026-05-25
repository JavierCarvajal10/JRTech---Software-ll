const API_KEY = process.env.GROQ_API_KEY;
const LLM_MODEL = process.env.GROQ_LLM_MODEL || "llama-3.3-70b-versatile";
const BASE_URL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";

export const PROVIDER_NAME = "groq";
// Groq no expone endpoint de embeddings. Dejamos undefined para que
// llm-provider sepa que este provider no puede generar vectores.
export const EMBEDDING_DIMENSIONS = undefined;

export async function embed(_text) {
  const err = new Error(
    "Groq no soporta embeddings. Configura EMBEDDING_PROVIDER=gemini u ollama."
  );
  err.code = "EMBED_NOT_SUPPORTED";
  throw err;
}

export async function chat(messages, systemPrompt, opts = {}) {
  if (!API_KEY) {
    const err = new Error("GROQ_API_KEY no está definida");
    err.code = "MISSING_API_KEY";
    throw err;
  }

  const { temperature = 0.1, maxTokens = 150 } = opts;

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature,
      max_tokens: maxTokens,
      top_p: 0.85,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const err = new Error(`Groq chat ${response.status}: ${body.slice(0, 300)}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
