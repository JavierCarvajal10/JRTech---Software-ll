import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Package,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { fetchMyOrders, type Order, type OrderStatus } from '../api/orders';
import { friendlyErrorMessage } from '../api/client';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  PAGADO: 'Pagado',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMADO: 'bg-blue-100 text-blue-800 border-blue-200',
  PAGADO: 'bg-green-100 text-green-800 border-green-200',
  ENVIADO: 'bg-purple-100 text-purple-800 border-purple-200',
  ENTREGADO: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELADO: 'bg-red-100 text-red-800 border-red-200',
};

const formatPrice = (n: number | string) => `$${Number(n).toLocaleString('es-CO')}`;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyOrders();
      setOrders(data);
    } catch (e) {
      setError(friendlyErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#9146FF]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9146FF] text-white rounded-lg hover:bg-[#7d3ce0] transition-colors font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis pedidos</h1>
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
            <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Aún no tienes pedidos</h2>
            <p className="text-gray-600 mb-8">
              Cuando hagas tu primera compra, la verás aquí con todos los detalles.
            </p>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 bg-[#9146FF] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#772CE8] transition-all shadow-lg hover:shadow-xl"
            >
              <Package className="w-5 h-5" />
              Explorar catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis pedidos</h1>
          <p className="text-gray-600">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} en total
          </p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-[#9146FF] transition-colors"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full p-6 flex items-center justify-between gap-4 text-left"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-[#9146FF]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">Pedido #{order.id}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            STATUS_COLORS[order.estado]
                          }`}
                        >
                          {STATUS_LABELS[order.estado]}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(order.fechaCreacion)} ·{' '}
                        {order.items.reduce((sum, it) => sum + it.cantidad, 0)} producto(s)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="font-bold text-[#9146FF] text-lg">
                        {formatPrice(order.total)}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-6 space-y-6 bg-gray-50">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">
                        Productos
                      </h3>
                      <div className="space-y-3">
                        {order.items.map((item) => {
                          const productImage = item.producto?.imagenes?.[0]?.url;
                          const productName =
                            item.producto?.nombre ?? `Producto #${item.productoId}`;
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 bg-white rounded-xl p-3 border border-gray-200"
                            >
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {productImage && (
                                  <ImageWithFallback
                                    src={productImage}
                                    alt={productName}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 truncate">
                                  {productName}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatPrice(item.precio)} × {item.cantidad}
                                </div>
                              </div>
                              <div className="font-bold text-gray-900 flex-shrink-0">
                                {formatPrice(Number(item.precio) * item.cantidad)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">
                        Envío
                      </h3>
                      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-1 text-sm">
                        <div className="text-gray-900 font-medium">{order.direccionEnvio}</div>
                        <div className="text-gray-600">
                          {[order.ciudadEnvio, order.departamentoEnvio, order.paisEnvio]
                            .filter(Boolean)
                            .join(', ')}
                          {order.codigoPostalEnvio && ` · ${order.codigoPostalEnvio}`}
                        </div>
                        {order.detallesAdicionales && (
                          <div className="text-gray-600 italic mt-2">
                            "{order.detallesAdicionales}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                      <span className="font-semibold text-gray-700">Total del pedido</span>
                      <span className="font-bold text-2xl text-[#9146FF]">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
