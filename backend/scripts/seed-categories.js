import { PrismaClient } from "@prisma/client";
import { pathToFileURL } from "node:url";

const taxonomy = [
  {
    nombre: "Apple",
    subcategorias: [
      "iPhone",
      "Mac / MacBook",
      "Apple Watch",
      "AirPods",
      "iPad / Accesorios",
    ],
  },
  {
    nombre: "Computadores",
    subcategorias: ["Laptops", "Monitores", "Mouse", "Teclados", "Cables"],
  },
  {
    nombre: "Componentes PC",
    subcategorias: [
      "GPU Gráficas",
      "Procesadores",
      "Boards",
      "RAM",
      "Almacenamiento",
      "Fuentes de poder",
      "Refri. líquida y aire",
      "Gabinetes",
    ],
  },
  {
    nombre: "Audio & Streaming",
    subcategorias: [
      "Audífonos",
      "Micrófonos",
      "Parlantes",
      "Cámaras",
      "Dispo. Streaming",
      "Alexas",
    ],
  },
  {
    nombre: "Accesorios",
    subcategorias: ["Mouse", "Teclados", "Cables"],
  },
];

async function ensureCategory(prisma, nombre, categoriaPadreId = null) {
  const existing = await prisma.categoria.findFirst({
    where: { nombre, categoriaPadreId },
  });
  if (existing) return existing;
  return prisma.categoria.create({
    data: { nombre, categoriaPadreId },
  });
}

export async function seedCategories(prisma) {
  let parents = 0;
  let children = 0;

  for (const cat of taxonomy) {
    const padre = await ensureCategory(prisma, cat.nombre, null);
    parents++;
    for (const subNombre of cat.subcategorias) {
      await ensureCategory(prisma, subNombre, padre.id);
      children++;
    }
  }

  console.log(`Categorías OK — ${parents} padre, ${children} subcategorías.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const prisma = new PrismaClient();
  seedCategories(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
