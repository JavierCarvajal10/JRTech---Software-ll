-- Producto: flag para marcar productos que solo se venden por importación
ALTER TABLE "Producto"
  ADD COLUMN "bajoImportacion" BOOLEAN NOT NULL DEFAULT false;

-- Importacion: vínculo opcional a un producto del catálogo cuando la solicitud
-- proviene del PC Builder. Cuando es null, la solicitud vino del formulario manual.
ALTER TABLE "Importacion"
  ADD COLUMN "productoId" INTEGER;

ALTER TABLE "Importacion"
  ADD CONSTRAINT "Importacion_productoId_fkey"
  FOREIGN KEY ("productoId") REFERENCES "Producto"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Importacion_productoId_idx" ON "Importacion"("productoId");

-- Índice para acelerar filtros frecuentes del PCBuilder
CREATE INDEX "Producto_categoriaId_bajoImportacion_idx"
  ON "Producto"("categoriaId", "bajoImportacion");
