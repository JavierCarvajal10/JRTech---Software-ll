export function parsearMensaje(texto) {
  return {
    precio_max: parsePrecio(texto),
    categoria: parseCategoria(texto),
    uso: parseUso(texto)
  };
}

export function parsePrecio(texto) {
  const t = texto.toLowerCase();

  const match = t.match(/(\d+(\.\d+)?)/);
  if (!match) return null;

  let valor = parseFloat(match[0]);

  if (t.includes("palo") || t.includes("millón") || t.includes("melon")) {
    return valor * 1_000_000;
  }

  if (t.includes("k") || t.includes("mil")) {
    return valor * 1_000;
  }

  return valor;
}

function parseCategoria(texto) {
  const t = texto.toLowerCase();

  if (t.includes("pc") || t.includes("computador") || t.includes("laptop")) {
    return "computador";
  }

  if (t.includes("celular") || t.includes("iphone")) {
    return "celular";
  }

  return null;
}

function parseUso(texto) {
  const t = texto.toLowerCase();

  if (t.includes("jugar") || t.includes("gaming")) return "gaming";
  if (t.includes("trabajo") || t.includes("oficina")) return "trabajo";
  if (t.includes("estudiar")) return "estudio";

  return null;
}