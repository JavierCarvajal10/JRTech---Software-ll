import { PrismaClient } from "@prisma/client";
import { pathToFileURL } from "node:url";

// Productos de prueba para el PC Builder, agrupados por subcategoría de
// "Componentes PC". Algunos con stock real, otros marcados como
// bajoImportacion para ejercitar ambos flujos en el frontend.
const componentes = {
  Procesadores: [
    {
      nombre: "AMD Ryzen 9 7950X",
      descripcion: "16 núcleos / 32 hilos, hasta 5.7 GHz, socket AM5",
      precio: 2899000,
      stock: 5,
      bajoImportacion: false,
      tipo: "procesador",
      especificaciones: [
        { clave: "Núcleos", valor: "16" },
        { clave: "Hilos", valor: "32" },
        { clave: "Socket", valor: "AM5" },
        { clave: "Frecuencia boost", valor: "5.7 GHz" },
      ],
    },
    {
      nombre: "Intel Core i9-14900K",
      descripcion: "24 núcleos / 32 hilos, hasta 6.0 GHz, socket LGA1700",
      precio: 3200000,
      stock: 0,
      bajoImportacion: true,
      tipo: "procesador",
      especificaciones: [
        { clave: "Núcleos", valor: "24" },
        { clave: "Hilos", valor: "32" },
        { clave: "Socket", valor: "LGA1700" },
        { clave: "Frecuencia boost", valor: "6.0 GHz" },
      ],
    },
    {
      nombre: "AMD Ryzen 7 7800X3D",
      descripcion: "8 núcleos / 16 hilos, 3D V-Cache, ideal gaming",
      precio: 1990000,
      stock: 3,
      bajoImportacion: false,
      tipo: "procesador",
      especificaciones: [
        { clave: "Núcleos", valor: "8" },
        { clave: "Hilos", valor: "16" },
        { clave: "Socket", valor: "AM5" },
      ],
    },
  ],
  Boards: [
    {
      nombre: "ASUS ROG Strix X670E-E",
      descripcion: "Socket AM5, DDR5, PCIe 5.0, WiFi 6E",
      precio: 1850000,
      stock: 4,
      bajoImportacion: false,
      tipo: "board",
    },
    {
      nombre: "MSI MAG B650 Tomahawk",
      descripcion: "Socket AM5, DDR5, PCIe 4.0, buena relación calidad-precio",
      precio: 890000,
      stock: 6,
      bajoImportacion: false,
      tipo: "board",
    },
    {
      nombre: "Gigabyte Z790 Aorus Elite AX",
      descripcion: "Socket LGA1700, DDR5, PCIe 5.0",
      precio: 1100000,
      stock: 0,
      bajoImportacion: true,
      tipo: "board",
    },
  ],
  RAM: [
    {
      nombre: "Corsair Vengeance RGB 32GB DDR5-6000",
      descripcion: "Kit 2x16GB DDR5 6000MHz CL36 con RGB",
      precio: 580000,
      stock: 12,
      bajoImportacion: false,
      tipo: "ram",
    },
    {
      nombre: "G.Skill Trident Z5 64GB DDR5-6400",
      descripcion: "Kit 2x32GB DDR5 6400MHz, top de gama",
      precio: 1200000,
      stock: 0,
      bajoImportacion: true,
      tipo: "ram",
    },
    {
      nombre: "Kingston Fury Beast 16GB DDR5-5200",
      descripcion: "Kit 2x8GB DDR5 5200MHz, entry level",
      precio: 290000,
      stock: 20,
      bajoImportacion: false,
      tipo: "ram",
    },
  ],
  "GPU Gráficas": [
    {
      nombre: "NVIDIA RTX 4090 Founders Edition",
      descripcion: "24GB GDDR6X, 450W TDP, tope de gama",
      precio: 8500000,
      stock: 0,
      bajoImportacion: true,
      tipo: "gpu",
      especificaciones: [
        { clave: "VRAM", valor: "24GB GDDR6X" },
        { clave: "TDP", valor: "450W" },
      ],
    },
    {
      nombre: "NVIDIA RTX 4070 Ti Super",
      descripcion: "16GB GDDR6X, ideal 1440p gaming",
      precio: 4200000,
      stock: 2,
      bajoImportacion: false,
      tipo: "gpu",
    },
    {
      nombre: "AMD Radeon RX 7900 XTX",
      descripcion: "24GB GDDR6, top AMD",
      precio: 4900000,
      stock: 0,
      bajoImportacion: true,
      tipo: "gpu",
    },
    {
      nombre: "NVIDIA RTX 4060",
      descripcion: "8GB GDDR6, gaming 1080p eficiente",
      precio: 1700000,
      stock: 8,
      bajoImportacion: false,
      tipo: "gpu",
    },
  ],
  Almacenamiento: [
    {
      nombre: "Samsung 990 Pro 2TB",
      descripcion: "NVMe Gen4, 7450 MB/s lectura, top performance",
      precio: 980000,
      stock: 7,
      bajoImportacion: false,
      tipo: "ssd",
    },
    {
      nombre: "WD Black SN850X 1TB",
      descripcion: "NVMe Gen4, 7300 MB/s lectura",
      precio: 580000,
      stock: 10,
      bajoImportacion: false,
      tipo: "ssd",
    },
    {
      nombre: "Crucial T705 4TB",
      descripcion: "NVMe Gen5, 14500 MB/s, top de gama",
      precio: 2400000,
      stock: 0,
      bajoImportacion: true,
      tipo: "ssd",
    },
  ],
  "Fuentes de poder": [
    {
      nombre: "Corsair RM1000e 1000W",
      descripcion: "80+ Gold, modular, ATX 3.0",
      precio: 750000,
      stock: 5,
      bajoImportacion: false,
      tipo: "psu",
    },
    {
      nombre: "EVGA SuperNOVA 850 P6",
      descripcion: "850W, 80+ Platinum, totalmente modular",
      precio: 620000,
      stock: 4,
      bajoImportacion: false,
      tipo: "psu",
    },
    {
      nombre: "Seasonic PRIME TX-1300W",
      descripcion: "80+ Titanium, ATX 3.0, máxima eficiencia",
      precio: 1500000,
      stock: 0,
      bajoImportacion: true,
      tipo: "psu",
    },
  ],
  "Refri. líquida y aire": [
    {
      nombre: "NZXT Kraken Elite 360 RGB",
      descripcion: "AIO 360mm, pantalla LCD, RGB",
      precio: 1100000,
      stock: 0,
      bajoImportacion: true,
      tipo: "cooling",
    },
    {
      nombre: "Corsair iCUE H150i Elite Capellix XT",
      descripcion: "AIO 360mm, RGB",
      precio: 850000,
      stock: 3,
      bajoImportacion: false,
      tipo: "cooling",
    },
    {
      nombre: "Noctua NH-D15",
      descripcion: "Torre doble, ultra silencioso, aire",
      precio: 480000,
      stock: 6,
      bajoImportacion: false,
      tipo: "cooling",
    },
  ],
  Gabinetes: [
    {
      nombre: "Lian Li O11 Dynamic EVO",
      descripcion: "Mid Tower, vidrio templado, modular",
      precio: 720000,
      stock: 4,
      bajoImportacion: false,
      tipo: "case",
    },
    {
      nombre: "NZXT H7 Flow",
      descripcion: "Mid Tower, alta ventilación frontal",
      precio: 560000,
      stock: 5,
      bajoImportacion: false,
      tipo: "case",
    },
    {
      nombre: "Fractal Design Torrent",
      descripcion: "Máximo flujo de aire, premium",
      precio: 950000,
      stock: 0,
      bajoImportacion: true,
      tipo: "case",
    },
  ],
};

async function findSubcategoria(prisma, nombre) {
  const padre = await prisma.categoria.findFirst({
    where: { nombre: "Componentes PC", categoriaPadreId: null },
  });
  if (!padre) {
    throw new Error(
      'No existe la categoría padre "Componentes PC". Corre seed-categories.js primero.'
    );
  }
  const sub = await prisma.categoria.findFirst({
    where: { nombre, categoriaPadreId: padre.id },
  });
  if (!sub) {
    throw new Error(
      `No existe la subcategoría "${nombre}" bajo "Componentes PC". Corre seed-categories.js para regenerarla.`
    );
  }
  return sub;
}

export async function seedPcComponents(prisma) {
  let creados = 0;
  let saltados = 0;

  for (const [subcategoria, items] of Object.entries(componentes)) {
    const cat = await findSubcategoria(prisma, subcategoria);

    for (const item of items) {
      const yaExiste = await prisma.producto.findFirst({
        where: { nombre: item.nombre },
      });
      if (yaExiste) {
        saltados++;
        continue;
      }

      const { especificaciones = [], ...resto } = item;
      await prisma.producto.create({
        data: {
          ...resto,
          categoriaId: cat.id,
          especificaciones: especificaciones.length
            ? { create: especificaciones }
            : undefined,
        },
      });
      creados++;
    }
  }

  console.log(`Componentes PC OK — ${creados} creados, ${saltados} ya existían.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const prisma = new PrismaClient();
  seedPcComponents(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
