const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const LLM_MODEL = process.env.LLM_MODEL || "qwen2.5:7b-instruct";
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text";

export const PROVIDER_NAME = "ollama";
export const EMBEDDING_DIMENSIONS = 768;

export async function embed(text) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBEDDING_MODEL, prompt: text })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Ollama embeddings ${response.status}: ${body}`);
  }

  const data = await response.json();
  if (!Array.isArray(data.embedding) || data.embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Embedding inválido (esperado ${EMBEDDING_DIMENSIONS} dims)`);
  }
  return data.embedding;
}

export async function chat(messages, systemPrompt, opts = {}) {
  const { temperature = 0.1, maxTokens = 150 } = opts;

  const response = await fetch(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature,
      max_tokens: maxTokens,
      top_p: 0.85,
      stop: ["<|im_start|>", "<|im_end|>", "<|endoftext|>"]
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Ollama chat ${response.status}: ${body}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
