import {
  findAllImports,
  findImportById,
  createImport,
  createImportsBulk,
  updateImportStatus,
  deleteImport,
} from "../repositories/import.repository.js";
import { findProductById } from "../repositories/product.repository.js";
import { validateNumber, NUM_LIMITS } from "../utils/numbers.js";

export const ESTADOS_IMPORTACION = [
  "PENDIENTE",
  "EN_PROCESO",
  "COTIZADO",
  "CERRADO",
  "CANCELADO",
];

export const listImports = async (filter = {}) => {
  return await findAllImports(filter);
};

export const getImport = async (id) => {
  const imp = await findImportById(id);
  if (!imp) throw new Error("Solicitud de importación no encontrada");
  return imp;
};

export const submitImport = async (data) => {
  const {
    nombre,
    telefono,
    email,
    producto,
    enlaceReferencia,
    descripcion,
    cantidad,
    presupuesto,
    ciudad,
    comoNosConocio,
  } = data;

  if (!nombre?.trim() || !telefono?.trim() || !producto?.trim()) {
    throw new Error("Nombre, teléfono y producto son obligatorios");
  }

  const cantidadNum =
    cantidad != null && cantidad !== ""
      ? validateNumber(cantidad, "La cantidad", NUM_LIMITS.importQuantity)
      : null;

  const presupuestoNum =
    presupuesto != null && presupuesto !== ""
      ? validateNumber(presupuesto, "El presupuesto", { ...NUM_LIMITS.priceUSD, integer: false })
      : null;

  return await createImport({
    nombre: nombre.trim(),
    telefono: telefono.trim(),
    email: email?.trim() ? email.trim().toLowerCase() : null,
    producto: producto.trim(),
    enlaceReferencia: enlaceReferencia?.trim() || null,
    descripcion: descripcion?.trim() || null,
    cantidad: cantidadNum,
    presupuesto: presupuestoNum,
    ciudad: ciudad?.trim() || null,
    comoNosConocio: comoNosConocio?.trim() || null,
  });
};

export const submitImportFromBuilder = async (data) => {
  const { nombre, telefono, email, ciudad, productoIds, notas } = data;

  if (!nombre?.trim() || !telefono?.trim()) {
    throw new Error("Nombre y teléfono son obligatorios");
  }

  if (!Array.isArray(productoIds) || productoIds.length === 0) {
    throw new Error("Debe incluir al menos un producto bajo importación");
  }

  // Cargar productos de la BD y validar que efectivamente sean bajoImportacion.
  // No queremos generar Importacion records para productos disponibles.
  const productos = [];
  for (const pid of productoIds) {
    const p = await findProductById(pid);
    if (!p) throw new Error(`Producto ${pid} no existe`);
    if (!p.bajoImportacion) {
      throw new Error(
        `Producto "${p.nombre}" no está marcado bajo importación; debe agregarse al carrito normal`
      );
    }
    productos.push(p);
  }

  const baseUser = {
    nombre: nombre.trim(),
    telefono: telefono.trim(),
    email: email?.trim() ? email.trim().toLowerCase() : null,
    ciudad: ciudad?.trim() || null,
    comoNosConocio: "PC Builder",
  };

  const records = productos.map((p) => ({
    ...baseUser,
    productoId: p.id,
    producto: p.nombre,
    descripcion: notas?.trim()
      ? `Solicitud generada desde Arma tu PC. Notas del cliente: ${notas.trim()}`
      : "Solicitud generada desde Arma tu PC.",
    presupuesto: Number(p.precio) || null,
    cantidad: 1,
  }));

  return await createImportsBulk(records);
};

export const changeImportStatus = async (id, estado) => {
  if (!ESTADOS_IMPORTACION.includes(estado)) {
    throw new Error(`Estado inválido. Debe ser uno de: ${ESTADOS_IMPORTACION.join(", ")}`);
  }
  const exists = await findImportById(id);
  if (!exists) throw new Error("Solicitud de importación no encontrada");
  return await updateImportStatus(id, estado);
};

export const removeImport = async (id) => {
  const exists = await findImportById(id);
  if (!exists) throw new Error("Solicitud de importación no encontrada");
  return await deleteImport(id);
};
