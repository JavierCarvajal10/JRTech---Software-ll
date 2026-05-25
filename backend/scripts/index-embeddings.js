import { PrismaClient } from "@prisma/client";
import {
  embedText,
  buildProductText,
  vectorToSqlLiteral
} from "../src/services/embedding.service.js";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const reindexAll = args.includes("--all");

  const productos = await prisma.producto.findMany({
    include: { especificaciones: true }
  });

  if (productos.length === 0) {
    console.log("No hay productos en la base de datos.");
    return;
  }

  let pendientes = productos;

  if (!reindexAll) {
    const conEmbedding = await prisma.$queryRaw`
      SELECT id FROM "Producto" WHERE embedding IS NOT NULL
    `;
    const ids = new Set(conEmbedding.map((r) => r.id));
    pendientes = productos.filter((p) => !ids.has(p.id));
  }

  console.log(
    `Total productos: ${productos.length}. A indexar: ${pendientes.length}` +
      (reindexAll ? " (reindex completo)" : "")
  );

  let ok = 0;
  let fail = 0;

  for (const p of pendientes) {
    const texto = buildProductText(p);
    try {
      const vector = await embedText(texto);
      const literal = vectorToSqlLiteral(vector);

      await prisma.$executeRawUnsafe(
        `UPDATE "Producto" SET embedding = $1::vector WHERE id = $2`,
        literal,
        p.id
      );

      ok++;
      console.log(`  [${ok}/${pendientes.length}] ${p.nombre}`);
    } catch (err) {
      fail++;
      console.error(`  Error en "${p.nombre}":`, err.message);
    }
  }

  console.log(`\nListo. Indexados: ${ok}. Fallos: ${fail}.`);
}

main()
  .catch((e) => {
    console.error("Error fatal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
