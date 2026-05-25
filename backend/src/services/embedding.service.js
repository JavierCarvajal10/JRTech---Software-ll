import { embed, EMBEDDING_DIMENSIONS as DIMS } from "./llm-provider.js";
import { isRagEnabled } from "./rag.config.js";
import db from "../config/database.js";

export const EMBEDDING_DIMENSIONS = DIMS;

export async function embedText(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("embedText requiere un string no vacío");
  }
  return embed(text.trim());
}

export function buildProductText(producto) {
  const specs = (producto.especificaciones || [])
    .map((e) => `${e.clave}: ${e.valor}`)
    .join(", ");

  const categoria = producto.categoria
    ? [producto.categoria.categoriaPadre?.nombre, producto.categoria.nombre]
        .filter(Boolean)
        .join(" > ")
    : "";

  return [
    producto.nombre,
    producto.descripcion || "",
    categoria ? `categoría: ${categoria}` : "",
    producto.tipo ? `tipo: ${producto.tipo}` : "",
    specs
  ]
    .filter(Boolean)
    .join(". ");
}

export function vectorToSqlLiteral(vector) {
  return `[${vector.join(",")}]`;
}

export async function indexProductEmbedding(productId) {
  if (!(await isRagEnabled())) return { skipped: true, reason: "rag-disabled" };

  const producto = await db.producto.findUnique({
    where: { id: Number(productId) },
    include: {
      especificaciones: true,
      categoria: { include: { categoriaPadre: true } },
    },
  });

  if (!producto) return { skipped: true, reason: "not-found" };

  try {
    const text = buildProductText(producto);
    const vector = await embedText(text);
    const literal = vectorToSqlLiteral(vector);

    await db.$executeRawUnsafe(
      `UPDATE "Producto" SET embedding = $1::vector WHERE id = $2`,
      literal,
      producto.id
    );

    return { skipped: false, id: producto.id };
  } catch (err) {
    console.warn(`[rag] indexProductEmbedding falló para id=${productId}:`, err.message);
    return { skipped: true, reason: "embed-error", error: err.message };
  }
}
