import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const RULES = [
  { match: /\b(iphone)\b/i, sub: "iPhone" },
  { match: /\b(macbook|imac|\bmac\b)\b/i, sub: "Mac / MacBook" },
  { match: /\bapple\s*watch\b/i, sub: "Apple Watch" },
  { match: /\bairpods?\b/i, sub: "AirPods" },
  { match: /\bipad\b/i, sub: "iPad / Accesorios" },

  { match: /\blaptop|notebook|portátil|portatil\b/i, sub: "Laptops" },
  { match: /\bmonitor(es)?\b/i, sub: "Monitores" },
  { match: /\b(mouse|rat[oó]n)\b/i, sub: "Mouse" },
  { match: /\b(teclado|keyboard)\b/i, sub: "Teclados" },
  { match: /\bcables?|hdmi|usb-c|displayport\b/i, sub: "Cables" },

  { match: /\b(rtx|gtx|geforce|radeon|gpu|tarjeta\s+gr[aá]fica)\b/i, sub: "GPU Gráficas" },
  { match: /\b(ryzen|intel\s*i[3579]|core\s*i[3579]|procesador|cpu)\b/i, sub: "Procesadores" },
  { match: /\b(motherboard|placa\s+base|board|asus\s+rog\s+strix\s+b\d|am[345])\b/i, sub: "Boards" },
  { match: /\b(ddr\d|\bram\b|memoria)\b/i, sub: "RAM" },
  { match: /\b(ssd|hdd|nvme|disco|almacenamiento)\b/i, sub: "Almacenamiento" },
  { match: /\b(fuente|psu|watts?)\b/i, sub: "Fuentes de poder" },
  { match: /\b(refrigeraci[oó]n|liquid|cooler|ventilador|fan)\b/i, sub: "Refri. líquida y aire" },

  { match: /\baud[ií]fono|auricular|headphone|wh-1000\b/i, sub: "Audífonos" },
  { match: /\bmicr[oó]fono|microphone|yeti|mic\b/i, sub: "Micrófonos" },
  { match: /\bparlante|speaker|altavoz\b/i, sub: "Parlantes" },
  { match: /\bc[aá]mara|webcam\b/i, sub: "Cámaras" },
  { match: /\b(stream\s*deck|streaming|capture)\b/i, sub: "Dispo. Streaming" },
  { match: /\b(alexa|echo)\b/i, sub: "Alexas" },

  { match: /\bpc\s*gamer|computador\s+escritorio|torre\b/i, parent: "Computadores" },
];

async function main() {
  const cats = await prisma.categoria.findMany();
  const bySubName = new Map(
    cats.filter((c) => c.categoriaPadreId !== null).map((c) => [c.nombre.toLowerCase(), c.id])
  );
  const byParentName = new Map(
    cats.filter((c) => c.categoriaPadreId === null).map((c) => [c.nombre.toLowerCase(), c.id])
  );

  const productos = await prisma.producto.findMany({
    where: { categoriaId: null },
  });

  console.log(`Productos sin categoría: ${productos.length}`);

  let updated = 0;
  let skipped = 0;

  for (const p of productos) {
    let categoriaId = null;
    let matchedRule = null;

    for (const rule of RULES) {
      if (!rule.match.test(p.nombre)) continue;
      if (rule.sub) {
        const id = bySubName.get(rule.sub.toLowerCase());
        if (id) {
          categoriaId = id;
          matchedRule = rule.sub;
          break;
        }
      }
      if (rule.parent) {
        const id = byParentName.get(rule.parent.toLowerCase());
        if (id) {
          categoriaId = id;
          matchedRule = rule.parent;
          break;
        }
      }
    }

    if (!categoriaId) {
      console.log(`  [skip] "${p.nombre}" — sin match`);
      skipped++;
      continue;
    }

    await prisma.producto.update({
      where: { id: p.id },
      data: { categoriaId },
    });
    console.log(`  [ok]   "${p.nombre}" → ${matchedRule}`);
    updated++;
  }

  console.log(`\nBackfill listo. Actualizados: ${updated}. Sin match: ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
