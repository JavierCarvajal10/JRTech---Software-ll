/*
  Warnings:

  - Made the column `contraseñaHash` on table `Usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "contraseñaHash" SET NOT NULL;
