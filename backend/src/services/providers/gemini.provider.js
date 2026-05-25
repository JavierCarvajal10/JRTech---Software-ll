import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const LLM_MODEL = process.env.GEMINI_LLM_MODEL || "gemini-2.5-flash";
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

export const PROVIDER_NAME = "gemini";
export const EMBEDDING_DIMENSIONS = 768;

let _client = null;
function getClient() {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY no está definida");
  }
  if (!_client) _client = new GoogleGenerativeAI(API_KEY);
  return _client;
}

export async function embed(text) {
  const model = getClient().getGenerativeModel({ model: EMBEDDING_MODEL });

  // gemini-embedding-001 sale en 3072 dims por defecto.
  // Truncamos a 768 con outputDimensionality (técnica Matryoshka) para que
  // matchee el schema vector(768) de la BD. Funciona porque pgvector usa
  // distancia coseno (<=>), que es invariante a magnitud.
  const result = await model.embedContent({
    content: { role: "user", parts: [{ text }] },
    outputDimensionality: EMBEDDING_DIMENSIONS
  });

  const values = result?.embedding?.values;

  if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Gemini embedding inválido (esperado ${EMBEDDING_DIMENSIONS}, recibido ${values?.length})`
    );
  }
  return values;
}

// Gemini usa "user" y "model"; nosotros usamos "user" y "assistant".
// Además exige que el primer mensaje sea "user" y los roles alternen.
function toGeminiContents(messages) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));
}

export async function chat(messages, systemPrompt, opts = {}) {
  const { temperature = 0.1, maxTokens = 150 } = opts;

  const model = getClient().getGenerativeModel({
    model: LLM_MODEL,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      topP: 0.85
    }
  });

  const result = await model.generateContent({
    contents: toGeminiContents(messages)
  });

  return result?.response?.text() || "";
}
