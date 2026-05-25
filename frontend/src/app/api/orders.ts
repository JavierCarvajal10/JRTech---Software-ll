import { apiRequest } from "./client";

export type OrderStatus =
  | "PENDIENTE"
  | "CONFIRMADO"
  | "PAGADO"
  | "ENVIADO"
  | "ENTREGADO"
  | "CANCELADO";

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDIENTE",
  "CONFIRMADO",
  "PAGADO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
];

export interface OrderItem {
  id: number;
  ordenId: number;
  productoId: number;
  cantidad: number;
  precio: string | number;
  producto?: {
    id: number;
    nombre: string;
    imagenes?: { url: string }[];
  };
}

export interface Order {
  id: number;
  usuarioId: number | null;
  total: string | number;
  estado: OrderStatus;
  direccionEnvio: string;
  ciudadEnvio: string | null;
  departamentoEnvio: string | null;
  paisEnvio: string | null;
  codigoPostalEnvio: string | null;
  detallesAdicionales: string | null;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  fechaCreacion: string;
  items: OrderItem[];
  usuario?: {
    id: number;
    email: string;
    primerNombre: string;
    primerApellido: string;
  } | null;
}

export interface CreateOrderInput {
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  direccionEnvio: string;
  ciudadEnvio?: string;
  departamentoEnvio?: string;
  paisEnvio?: string;
  codigoPostalEnvio?: string;
  detallesAdicionales?: string;
  items: { productoId: number; cantidad: number }[];
}

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  const res = await apiRequest<{ data: Order }>("/api/ordenes", {
    method: "POST",
    body: input,
  });
  return res.data;
};

export const listOrders = async (estado?: OrderStatus): Promise<Order[]> => {
  const query = estado ? `?estado=${estado}` : "";
  const res = await apiRequest<{ data: Order[] }>(`/api/ordenes${query}`);
  return res.data;
};

export const fetchOrder = async (id: number): Promise<Order> => {
  const res = await apiRequest<{ data: Order }>(`/api/ordenes/${id}`);
  return res.data;
};

export const updateOrderStatus = async (
  id: number,
  estado: OrderStatus
): Promise<Order> => {
  const res = await apiRequest<{ data: Order }>(`/api/ordenes/${id}/estado`, {
    method: "PATCH",
    body: { estado },
  });
  return res.data;
};

export const fetchMyOrders = async (): Promise<Order[]> => {
  const res = await apiRequest<{ data: Order[] }>("/api/ordenes/mis");
  return res.data;
};
