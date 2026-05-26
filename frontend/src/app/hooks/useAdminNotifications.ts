// Notificaciones del panel admin derivadas del estado actual de la BD.
// NO hay tabla de notificaciones: cada categoría se calcula leyendo datos
// que ya existen (órdenes, importaciones, productos). Es liviano y
// suficiente para un MVP: muestra al admin lo que requiere atención AHORA.
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Package, AlertTriangle, type LucideIcon } from "lucide-react";
import { listOrders } from "../api/orders";
import { listImports } from "../api/imports";
import { fetchProducts } from "../api/products";

// Umbral de "stock bajo". Si en el futuro lo configuran desde admin se mueve a env/config.
const LOW_STOCK_THRESHOLD = 5;

export interface AdminNotification {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  count: number;
  /** Clases Tailwind para el círculo del icono (background + texto). */
  iconClasses: string;
}

interface UseAdminNotificationsResult {
  items: AdminNotification[];
  totalCount: number;
  loading: boolean;
}

const STALE_MS = 30 * 1000; // 30s — evita refetch en cada focus.

export function useAdminNotifications(): UseAdminNotificationsResult {
  const ordersQuery = useQuery({
    queryKey: ["admin", "notifications", "orders"],
    queryFn: () => listOrders(),
    staleTime: STALE_MS,
  });
  const importsQuery = useQuery({
    queryKey: ["admin", "notifications", "imports"],
    queryFn: () => listImports(),
    staleTime: STALE_MS,
  });
  const productsQuery = useQuery({
    queryKey: ["admin", "notifications", "products"],
    // includeOutOfStock=true para detectar también productos con stock=0
    // (que son precisamente el caso más urgente de "stock bajo").
    queryFn: () => fetchProducts({ includeOutOfStock: true }),
    staleTime: STALE_MS,
  });

  const loading =
    ordersQuery.isLoading || importsQuery.isLoading || productsQuery.isLoading;

  const pendingOrders =
    ordersQuery.data?.filter((o) => o.estado === "PENDIENTE").length ?? 0;
  const pendingImports =
    importsQuery.data?.filter((i) => i.estado === "PENDIENTE").length ?? 0;
  const lowStockProducts =
    productsQuery.data?.filter((p) => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD).length ?? 0;

  const items: AdminNotification[] = [];

  if (pendingOrders > 0) {
    items.push({
      id: "orders-pending",
      icon: ShoppingBag,
      title: pendingOrders === 1 ? "1 pedido pendiente" : `${pendingOrders} pedidos pendientes`,
      description: "Necesitan revisión o confirmación.",
      count: pendingOrders,
      iconClasses: "bg-[#F5F0FF] text-[#9146FF]",
    });
  }

  if (pendingImports > 0) {
    items.push({
      id: "imports-pending",
      icon: Package,
      title:
        pendingImports === 1
          ? "1 importación pendiente"
          : `${pendingImports} importaciones pendientes`,
      description: "Solicitudes esperando cotización.",
      count: pendingImports,
      iconClasses: "bg-blue-50 text-blue-600",
    });
  }

  if (lowStockProducts > 0) {
    items.push({
      id: "products-low-stock",
      icon: AlertTriangle,
      title:
        lowStockProducts === 1
          ? "1 producto con stock bajo"
          : `${lowStockProducts} productos con stock bajo`,
      description: `Stock menor o igual a ${LOW_STOCK_THRESHOLD} unidades.`,
      count: lowStockProducts,
      iconClasses: "bg-amber-50 text-amber-600",
    });
  }

  const totalCount = pendingOrders + pendingImports + lowStockProducts;

  return { items, totalCount, loading };
}
