import {
  findAllOrders,
  findOrderById,
  findOrdersByUserId,
  createOrderWithStockDecrement,
  updateOrderStatus,
} from "../repositories/order.repository.js";
import { validateNumber, NUM_LIMITS } from "../utils/numbers.js";

export const ESTADOS_ORDEN = [
  "PENDIENTE",
  "CONFIRMADO",
  "PAGADO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
];

export const listOrders = async (filter = {}) => {
  return await findAllOrders(filter);
};

export const getOrder = async (id) => {
  const order = await findOrderById(id);
  if (!order) throw new Error("Orden no encontrada");
  return order;
};

export const getOrdersForUser = async (usuarioId) => {
  return await findOrdersByUserId(usuarioId);
};

export const createOrder = async (data, usuarioId = null) => {
  const {
    items,
    nombreCliente,
    emailCliente,
    telefonoCliente,
    direccionEnvio,
    ciudadEnvio,
    departamentoEnvio,
    paisEnvio,
    codigoPostalEnvio,
    detallesAdicionales,
  } = data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("La orden debe tener al menos un item");
  }
  if (!nombreCliente || !emailCliente || !telefonoCliente || !direccionEnvio) {
    throw new Error("Faltan datos del cliente: nombre, email, teléfono o dirección");
  }
  for (const it of items) {
    if (!it.productoId) {
      throw new Error("Cada item debe tener un productoId");
    }
    it.cantidad = validateNumber(it.cantidad, "La cantidad", NUM_LIMITS.orderQuantity);
  }

  return await createOrderWithStockDecrement({
    usuarioId,
    nombreCliente,
    emailCliente: emailCliente.toLowerCase(),
    telefonoCliente,
    direccionEnvio,
    ciudadEnvio: ciudadEnvio ?? null,
    departamentoEnvio: departamentoEnvio ?? null,
    paisEnvio: paisEnvio ?? null,
    codigoPostalEnvio: codigoPostalEnvio ?? null,
    detallesAdicionales: detallesAdicionales ?? null,
    items: items.map((it) => ({
      productoId: Number(it.productoId),
      cantidad: Number(it.cantidad),
    })),
  });
};

export const changeOrderStatus = async (id, estado) => {
  if (!ESTADOS_ORDEN.includes(estado)) {
    throw new Error(`Estado inválido. Debe ser uno de: ${ESTADOS_ORDEN.join(", ")}`);
  }
  const exists = await findOrderById(id);
  if (!exists) throw new Error("Orden no encontrada");
  return await updateOrderStatus(id, estado);
};
