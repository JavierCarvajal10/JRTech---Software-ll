import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedCategories } from "../scripts/seed-categories.js";
import { ROLES } from "../src/config/roles.js";

const prisma = new PrismaClient();

async function seedOwner() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("[seed] ADMIN_EMAIL / ADMIN_PASSWORD no definidos — saltando owner");
    return;
  }

  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.usuario.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing?.rol === ROLES.OWNER) {
    console.log(`Owner ya existe: ${normalizedEmail}`);
    return;
  }

  if (existing) {
    await prisma.usuario.update({
      where: { id: existing.id },
      data: { rol: ROLES.OWNER },
    });
    console.log(`Usuario promovido a OWNER: ${normalizedEmail}`);
    return;
  }

  await prisma.usuario.create({
    data: {
      email: normalizedEmail,
      contraseñaHash: await bcrypt.hash(password, 10),
      primerNombre: process.env.ADMIN_NOMBRE ?? "Owner",
      primerApellido: process.env.ADMIN_APELLIDO ?? "JRTech",
      rol: ROLES.OWNER,
    },
  });
  console.log(`Owner creado: ${normalizedEmail}`);
}

async function main() {
  console.log("[seed] Sembrando categorías...");
  await seedCategories(prisma);

  console.log("[seed] Sembrando owner...");
  await seedOwner();

  console.log("[seed] Listo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
