import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log("Uso: npm run create:admin -- <email> <password> [primerNombre] [primerApellido]");
    console.log("Ejemplo: npm run create:admin -- admin@jrtech.com admin1234 Luis Sánchez");
    process.exit(1);
  }

  const [email, password, primerNombre = "Admin", primerApellido = "JRTech"] = args;

  if (password.length < 6) {
    console.error("Error: la contraseña debe tener al menos 6 caracteres");
    process.exit(1);
  }

  const existing = await prisma.usuario.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    if (existing.rol === "ADMIN") {
      console.log(`El usuario ${email} ya existe y ya es ADMIN. ID: ${existing.id}`);
    } else {
      const promoted = await prisma.usuario.update({
        where: { id: existing.id },
        data: { rol: "ADMIN" },
      });
      console.log(`Usuario ${email} promovido a ADMIN. ID: ${promoted.id}`);
    }
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const created = await prisma.usuario.create({
    data: {
      email: email.toLowerCase(),
      contraseñaHash: hashed,
      primerNombre,
      primerApellido,
      rol: "ADMIN",
    },
  });

  console.log(`Admin creado exitosamente.`);
  console.log(`  Email: ${created.email}`);
  console.log(`  ID: ${created.id}`);
  console.log(`  Rol: ${created.rol}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
