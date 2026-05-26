import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ROLES } from "../src/config/roles.js";

const prisma = new PrismaClient();

// Crea un usuario admin/owner, o si ya existe le RESTABLECE la contraseña y el rol.
// Uso:
//   npm run create:admin -- <email> <password> [primerNombre] [primerApellido] [--role=OWNER|ADMIN]
// Ejemplos:
//   npm run create:admin -- admin@ejemplo.com CambiaEstaClave1 Nombre Apellido
//   npm run create:admin -- soporte@ejemplo.com OtraClave1 Soporte JRTech --role=ADMIN
async function main() {
  const rawArgs = process.argv.slice(2);

  // Extrae el flag opcional --role=XXX (por defecto OWNER, el rol más alto).
  const roleArg = rawArgs.find((a) => a.startsWith("--role="));
  const role = (roleArg?.split("=")[1] || ROLES.OWNER).toUpperCase();
  const args = rawArgs.filter((a) => !a.startsWith("--role="));

  if (args.length < 2) {
    console.log(
      "Uso: npm run create:admin -- <email> <password> [primerNombre] [primerApellido] [--role=OWNER|ADMIN]"
    );
    process.exit(1);
  }

  if (![ROLES.OWNER, ROLES.ADMIN].includes(role)) {
    console.error(`Error: rol inválido "${role}". Usa OWNER o ADMIN.`);
    process.exit(1);
  }

  const [emailRaw, password, primerNombre = "Admin", primerApellido = "JRTech"] = args;
  const email = emailRaw.trim().toLowerCase();

  if (password.length < 6) {
    console.error("Error: la contraseña debe tener al menos 6 caracteres");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);
  const existing = await prisma.usuario.findUnique({ where: { email } });

  if (existing) {
    await prisma.usuario.update({
      where: { id: existing.id },
      data: { contraseñaHash: hashed, rol: role },
    });
    console.log(`Usuario actualizado: contraseña restablecida y rol = ${role}`);
    console.log(`   Email: ${email}  (ID: ${existing.id})`);
    return;
  }

  const created = await prisma.usuario.create({
    data: {
      email,
      contraseñaHash: hashed,
      primerNombre,
      primerApellido,
      rol: role,
    },
  });

  console.log(`Usuario creado con rol ${role}.`);
  console.log(`   Email: ${created.email}  (ID: ${created.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
