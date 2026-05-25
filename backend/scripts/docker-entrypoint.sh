#!/bin/sh
set -e

echo "[entrypoint] Esperando a Postgres en $DATABASE_URL ..."
until node -e "
  import('@prisma/client').then(async ({ PrismaClient }) => {
    const p = new PrismaClient();
    try { await p.\$queryRawUnsafe('SELECT 1'); process.exit(0); }
    catch { process.exit(1); }
    finally { await p.\$disconnect(); }
  });
" 2>/dev/null; do
  echo "[entrypoint] Postgres no responde aún, reintento en 2s..."
  sleep 2
done
echo "[entrypoint] Postgres listo."

echo "[entrypoint] Aplicando migraciones..."
npx prisma migrate deploy

echo "[entrypoint] Seedeando categorías y productos..."
node -e "
  import('@prisma/client').then(async ({ PrismaClient }) => {
    const p = new PrismaClient();
    const n = await p.producto.count();
    await p.\$disconnect();
    const { spawnSync } = await import('child_process');
    // Categorías y componentes PC son idempotentes (skip si ya existen)
    spawnSync('node', ['scripts/seed-categories.js'], { stdio: 'inherit' });
    spawnSync('node', ['scripts/seed-pc-components.js'], { stdio: 'inherit' });
    if (n === 0) {
      console.log('[entrypoint] Productos generales vacíos, corriendo seed inicial...');
      const r = spawnSync('node', ['prisma/seed.js'], { stdio: 'inherit' });
      process.exit(r.status || 0);
    } else {
      console.log('[entrypoint] Ya hay ' + n + ' productos, skip seed inicial.');
    }
  });
"

echo "[entrypoint] Indexando embeddings de productos sin vector..."
node scripts/index-embeddings.js || echo "[entrypoint] Indexación falló (probablemente Ollama no está disponible). Continuando..."

echo "[entrypoint] Arrancando servidor..."
exec node index.js
