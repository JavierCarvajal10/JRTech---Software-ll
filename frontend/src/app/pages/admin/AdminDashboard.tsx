import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { TrendingUp, ShoppingBag, AlertCircle, Package, Loader2 } from 'lucide-react';
import { listOrders, type Order, type OrderStatus } from '../../api/orders';
import { fetchProducts, type Product } from '../../api/products';
import { friendlyErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/admin/ErrorState';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  PAGADO: 'bg-green-100 text-green-800',
  ENVIADO: 'bg-purple-100 text-purple-800',
  ENTREGADO: 'bg-gray-100 text-gray-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

const formatPrice = (n: number) => `$${n.toLocaleString('es-CO')}`;

const isToday = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

const isThisMonth = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([listOrders(), fetchProducts({ includeOutOfStock: true })])
      .then(([o, p]) => {
        if (!cancelled) {
          setOrders(o);
          setProducts(p);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(friendlyErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    return load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const billable = useMemo(
    () => orders.filter((o) => o.estado !== 'CANCELADO'),
    [orders]
  );

  const ventasHoy = billable
    .filter((o) => isToday(o.fechaCreacion))
    .reduce((sum, o) => sum + Number(o.total), 0);

  const ventasMes = billable
    .filter((o) => isThisMonth(o.fechaCreacion))
    .reduce((sum, o) => sum + Number(o.total), 0);

  const pendientes = orders.filter((o) => o.estado === 'PENDIENTE').length;
  const sinStock = products.filter((p) => p.stock === 0).length;

  const recentOrders = orders.slice(0, 5);

  const topProducts = useMemo(() => {
    const counts = new Map<number, { name: string; sales: number; revenue: number }>();
    for (const o of billable) {
      for (const item of o.items) {
        const existing = counts.get(item.productoId) ?? {
          name: item.producto?.nombre ?? `Producto #${item.productoId}`,
          sales: 0,
          revenue: 0,
        };
        existing.sales += item.cantidad;
        existing.revenue += Number(item.precio) * item.cantidad;
        counts.set(item.productoId, existing);
      }
    }
    return Array.from(counts.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [billable]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-[#9146FF]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Resumen del estado actual de la tienda</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <ErrorState message={error} onRetry={load} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen del estado actual de la tienda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Ventas hoy"
          value={formatPrice(ventasHoy)}
          icon={TrendingUp}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <KpiCard
          title="Ventas del mes"
          value={formatPrice(ventasMes)}
          icon={ShoppingBag}
          color="text-[#9146FF]"
          bgColor="bg-[#F5F0FF]"
        />
        <KpiCard
          title="Pedidos pendientes"
          value={String(pendientes)}
          icon={Package}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <KpiCard
          title="Productos sin stock"
          value={String(sinStock)}
          icon={AlertCircle}
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Últimos pedidos</h2>
            <Link to="/admin/pedidos" className="text-sm text-[#9146FF] hover:underline">
              Ver todos
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Aún no hay pedidos</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">#{order.id}</div>
                    <div className="text-sm text-gray-600">{order.nombreCliente}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatPrice(Number(order.total))}</div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[order.estado]}`}
                    >
                      {order.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Productos más vendidos</h2>
          {topProducts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Aún no hay ventas registradas</div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#9146FF] to-[#772CE8] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.sales} unidades</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#9146FF]">{formatPrice(product.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 truncate">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}
