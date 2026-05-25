import {
  listOrders,
  getOrder,
  getOrdersForUser,
  createOrder,
  changeOrderStatus,
} from "../services/order.service.js";
import { verifyToken } from "../services/auth.service.js";
import { AUTH_COOKIE_NAME } from "../utils/cookies.js";

const tryGetUser = (req) => {
  // Lee de cookie httpOnly o Authorization header (compat).
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  const headerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = cookieToken || headerToken;
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    return { id: payload.id, email: payload.email, rol: payload.rol };
  } catch {
    return null;
  }
};

export const list = async (req, res) => {
  try {
    const { estado } = req.query;
    const orders = await listOrders(estado ? { estado } : {});
    res.status(200).json({ data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const order = await getOrder(req.params.id);
    res.status(200).json({ data: order });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const myOrders = async (req, res) => {
  try {
    const orders = await getOrdersForUser(req.user.id);
    res.status(200).json({ data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const authUser = tryGetUser(req);
    // Si está autenticado, forzamos email/usuarioId del JWT — el cliente no
    // puede crear órdenes a nombre de otra cuenta aunque mande otro email.
    const payload = authUser
      ? { ...req.body, emailCliente: authUser.email }
      : req.body;
    const order = await createOrder(payload, authUser?.id ?? null);
    res.status(201).json({
      message: "Orden creada correctamente",
      data: order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const order = await changeOrderStatus(req.params.id, req.body.estado);
    res.status(200).json({
      message: "Estado actualizado",
      data: order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
