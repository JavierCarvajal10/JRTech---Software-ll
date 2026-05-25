/*
  Warnings:

  - Added the required column `emailCliente` to the `Orden` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombreCliente` to the `Orden` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefonoCliente` to the `Orden` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Orden" DROP CONSTRAINT "Orden_usuarioId_fkey";

-- DropIndex
DROP INDEX "Producto_embedding_idx";

-- AlterTable
ALTER TABLE "Orden" ADD COLUMN     "ciudadEnvio" TEXT,
ADD COLUMN     "codigoPostalEnvio" TEXT,
ADD COLUMN     "departamentoEnvio" TEXT,
ADD COLUMN     "detallesAdicionales" TEXT,
ADD COLUMN     "emailCliente" TEXT NOT NULL,
ADD COLUMN     "nombreCliente" TEXT NOT NULL,
ADD COLUMN     "paisEnvio" TEXT,
ADD COLUMN     "telefonoCliente" TEXT NOT NULL,
ALTER COLUMN "usuarioId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Orden" ADD CONSTRAINT "Orden_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
