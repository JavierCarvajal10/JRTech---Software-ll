import db from "../config/database.js";

const orderInclude = {
  items: {
    include: {
      producto: {
        include: {
          imagenes: { take: 1 },
        },
      },
    },
  },
  usuario: {
    select: {
      id: true,
      email: true,
      primerNombre: true,
      primerApellido: true,
    },
  },
};

export const findAllOrders = async ({ estado } = {}) => {
  return await db.orden.findMany({
    where: estado ? { estado } : undefined,
    orderBy: { fechaCreacion: "desc" },
    include: orderInclude,
  });
};

export const findOrderById = async (id) => {
  return await db.orden.findUnique({
    where: { id: Number(id) },
    include: orderInclude,
  });
};

export const findOrdersByUserId = async (usuarioId) => {
  return await db.orden.findMany({
    where: { usuarioId: Number(usuarioId) },
    orderBy: { fechaCreacion: "desc" },
    include: orderInclude,
  });
};

export const createOrderWithStockDecrement = async ({
  usuarioId,
  nombreCliente,
  emailCliente,
  telefonoCliente,
  direccionEnvio,
  ciudadEnvio,
  departamentoEnvio,
  paisEnvio,
  codigoPostalEnvio,
  detallesAdicionales,
  items,
}) => {
  return await db.$transaction(async (tx) => {
    const productIds = items.map((i) => i.productoId);
    const productos = await tx.producto.findMany({
      where: { id: { in: productIds } },
      select: { id: true, nombre: true, precio: true, stock: true },
    });
    const byId = new Map(productos.map((p) => [p.id, p]));

    let total = 0;
    const itemsToCreate = items.map((it) => {
      const prod = byId.get(it.productoId);
      if (!prod) {
        throw new Error(`Producto ${it.productoId} no existe`);
      }
      if (prod.stock < it.cantidad) {
        throw new Error(
          `Stock insuficiente para "${prod.nombre}" (disponible: ${prod.stock}, solicitado: ${it.cantidad})`
        );
      }
      const precio = Number(prod.precio);
      total += precio * it.cantidad;
      return {
        productoId: it.productoId,
        cantidad: it.cantidad,
        precio,
      };
    });

    for (const it of items) {
      await tx.producto.update({
        where: { id: it.productoId },
        data: { stock: { decrement: it.cantidad } },
      });
    }

    return await tx.orden.create({
      data: {
        usuarioId: usuarioId ?? null,
        nombreCliente,
        emailCliente,
        telefonoCliente,
        direccionEnvio,
        ciudadEnvio,
        departamentoEnvio,
        paisEnvio,
        codigoPostalEnvio,
        detallesAdicionales,
        total,
        items: { create: itemsToCreate },
      },
      include: orderInclude,
    });
  });
};

export const updateOrderStatus = async (id, estado) => {
  return await db.orden.update({
    where: { id: Number(id) },
    data: { estado },
    include: orderInclude,
  });
};
