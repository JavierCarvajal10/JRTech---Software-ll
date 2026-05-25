import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
try {
  const version = await prisma.$queryRawUnsafe(`SELECT version() AS v`);
  const sharedir = await prisma.$queryRawUnsafe(`SHOW data_directory`);
  console.log("Versión:", version[0].v);
  console.log("Data dir:", sharedir[0].data_directory);
} catch (e) {
  console.error("ERROR:", e.message);
} finally {
  await prisma.$disconnect();
}
