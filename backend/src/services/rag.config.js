import db from "../config/database.js";

let cachedStatus = null;

export async function isRagEnabled() {
  if (cachedStatus !== null) return cachedStatus.enabled;

  try {
    const cols = await db.$queryRawUnsafe(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'Producto' AND column_name = 'embedding'`
    );
    const hasColumn = cols.length > 0;

    let hasExtension = false;
    if (hasColumn) {
      const ext = await db.$queryRawUnsafe(
        `SELECT extname FROM pg_extension WHERE extname = 'vector'`
      );
      hasExtension = ext.length > 0;
    }

    const enabled = hasColumn && hasExtension;
    cachedStatus = { enabled, reason: enabled ? "ready" : (hasColumn ? "missing-extension" : "missing-column") };

    if (enabled) {
      console.log("[rag] pgvector activo — semantic search habilitado");
    } else {
      console.log(
        `[rag] pgvector NO disponible (${cachedStatus.reason}) — usando keyword + LLM-as-retriever. ` +
          `Para activarlo, aplicá la migración pgvector y reindexa con 'npm run embeddings:index'.`
      );
    }
    return enabled;
  } catch (err) {
    console.warn("[rag] error detectando pgvector:", err.message);
    cachedStatus = { enabled: false, reason: "detection-error" };
    return false;
  }
}

export function invalidateRagCache() {
  cachedStatus = null;
}
