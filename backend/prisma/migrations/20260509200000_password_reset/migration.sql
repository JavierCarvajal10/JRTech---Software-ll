-- AlterTable
ALTER TABLE "Usuario"
  ADD COLUMN "resetPasswordTokenHash" TEXT,
  ADD COLUMN "resetPasswordExpires" TIMESTAMP(3);
