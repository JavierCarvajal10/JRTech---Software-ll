-- Habilita la extensión pgvector en la base de datos
CREATE EXTENSION IF NOT EXISTS vector;

-- Añade columna embedding al Producto (768 dimensiones = tamaño de nomic-embed-text)
ALTER TABLE "Producto" ADD COLUMN "embedding" vector(768);

-- Índice HNSW para búsqueda rápida por similitud coseno
-- HNSW es más rápido que ivfflat en queries y no requiere reconstrucción al insertar
CREATE INDEX "Producto_embedding_idx"
  ON "Producto"
  USING hnsw ("embedding" vector_cosine_ops);
