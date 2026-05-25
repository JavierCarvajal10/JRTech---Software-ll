import * as ollama from "./providers/ollama.provider.js";
import * as gemini from "./providers/gemini.provider.js";
import * as groq from "./providers/groq.provider.js";

const PROVIDERS = { ollama, gemini, groq };

const PRIMARY_NAME = (process.env.LLM_PROVIDER || "ollama").toLowerCase();

// LLM_FALLBACK_PROVIDERS = "groq,ollama"  (orden de preferencia)
// Cuando el primary falla por cuota o caída, se intenta el siguiente.
const FALLBACK_NAMES = (process.env.LLM_FALLBACK_PROVIDERS || "")
  .toLowerCase()
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const primary = PROVIDERS[PRIMARY_NAME];
if (!primary) {
  throw new Error(
    `LLM_PROVIDER inválido: "${PRIMARY_NAME}". Opciones: ${Object.keys(PROVIDERS).join(", ")}`
  );
}

const fallbacks = [];
for (const name of FALLBACK_NAMES) {
  const p = PROVIDERS[name];
  if (!p) {
    console.warn(
      `[llm-provider] LLM_FALLBACK_PROVIDERS contiene "${name}" desconocido; lo ignoro`
    );
    continue;
  }
  if (p === primary || fallbacks.includes(p)) continue;
  fallbacks.push(p);
}

console.log(
  `[llm-provider] primary=${primary.PROVIDER_NAME}` +
    (fallbacks.length > 0
      ? `, fallbacks=[${fallbacks.map((f) => f.PROVIDER_NAME).join(", ")}]`
      : "")
);

// === Embeddings ===
// Resolución: 1) EMBEDDING_PROVIDER override, 2) primary si soporta,
// 3) primer fallback que soporte. Si ninguno soporta → RAG deshabilitado.
const EMBED_OVERRIDE = (process.env.EMBEDDING_PROVIDER || "").toLowerCase();
let embedProvider = null;

if (EMBED_OVERRIDE) {
  const p = PROVIDERS[EMBED_OVERRIDE];
  if (!p) {
    console.warn(
      `[llm-provider] EMBEDDING_PROVIDER="${EMBED_OVERRIDE}" desconocido; uso autodetect`
    );
  } else if (!p.EMBEDDING_DIMENSIONS) {
    console.warn(
      `[llm-provider] EMBEDDING_PROVIDER="${EMBED_OVERRIDE}" no soporta embeddings; uso autodetect`
    );
  } else {
    embedProvider = p;
  }
}

if (!embedProvider) {
  embedProvider = [primary, ...fallbacks].find(
    (p) => typeof p.embed === "function" && p.EMBEDDING_DIMENSIONS
  );
}

if (embedProvider) {
  console.log(
    `[llm-provider] embeddings=${embedProvider.PROVIDER_NAME} (${embedProvider.EMBEDDING_DIMENSIONS} dims)`
  );
} else {
  console.warn(
    "[llm-provider] Ningún provider configurado soporta embeddings; RAG quedará deshabilitado"
  );
}

export const EMBEDDING_DIMENSIONS = embedProvider?.EMBEDDING_DIMENSIONS;
export const ACTIVE_PROVIDER = primary.PROVIDER_NAME;

export async function embed(text) {
  if (!embedProvider) {
    const err = new Error("Ningún provider configurado soporta embeddings");
    err.code = "NO_EMBEDDING_PROVIDER";
    throw err;
  }
  return embedProvider.embed(text);
}

function isRetriableError(err) {
  const status = err.status ?? err.response?.status;
  if (status === 429) return true;
  if (status >= 500 && status < 600) return true;
  const msg = err.message ?? "";
  if (/quota|rate limit|too many requests|timeout|ECONNREFUSED|ENOTFOUND|fetch failed/i.test(msg)) {
    return true;
  }
  if (err.code === "MISSING_API_KEY") return true;
  if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") return true;
  return false;
}

export async function chat(messages, systemPrompt, opts) {
  const chain = [primary, ...fallbacks];
  let lastErr = null;

  for (let i = 0; i < chain.length; i++) {
    const p = chain[i];
    try {
      const res = await p.chat(messages, systemPrompt, opts);
      if (i > 0) {
        console.warn(
          `[llm-provider] respuesta servida por fallback "${p.PROVIDER_NAME}" tras fallo de primary`
        );
      }
      return res;
    } catch (err) {
      lastErr = err;
      const isLast = i === chain.length - 1;
      if (!isRetriableError(err) || isLast) {
        throw err;
      }
      console.warn(
        `[llm-provider] "${p.PROVIDER_NAME}" falló (${err.status ?? err.code ?? "error"}); probando siguiente`
      );
    }
  }

  throw lastErr;
}
