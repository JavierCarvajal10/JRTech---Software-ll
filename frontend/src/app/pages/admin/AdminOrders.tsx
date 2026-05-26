import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Eye, MessageCircle, Package, Loader2, X } from 'lucide-react';
import {
  listOrders,
  updateOrderStatus,
  ORDER_STATUSES,
  type Order,
  type OrderStatus,
} from '../../api/orders';
import { friendlyErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { ErrorState } from '../../components/admin/ErrorState';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  PAGADO: 'bg-green-100 text-green-800',
  ENVIADO: 'bg-purple-100 text-purple-800',
  ENTREGADO: 'bg-gray-100 text-gray-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

const formatPrice = (n: number | string) =>
  `$${Number(n).toLocaleString('es-CO')}`;

const itemCount = (o: Order) =>
  o.items.reduce((sum, it) => sum + it.cantidad, 0);

export function AdminOrders() {
  const { showSuccess, showError } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'TODOS' | OrderStatus>('TODOS');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listOrders();
      setOrders(data);
    } catch (e) {
      setError(friendlyErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleStatusChange = async (orderId: number, estado: OrderStatus) => {
    const previousOrders = orders;
    // Optimistic update: cambia inmediatamente en la UI
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, estado } : o)));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, estado } : null));
    }
    setUpdatingId(orderId);

    try {
      await updateOrderStatus(orderId, estado);
      showSuccess('Estado actualizado', `Pedido #${orderId} → ${estado}`);
    } catch (e) {
      // Revertir si falla
      setOrders(previousOrders);
      if (selectedOrder?.id === orderId) {
        const original = previousOrders.find((o) => o.id === orderId);
        if (original) setSelectedOrder(original);
      }
      showError('No se pudo actualizar el estado', friendlyErrorMessage(e));
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (selectedStatus !== 'TODOS' && o.estado !== selectedStatus) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        String(o.id).includes(q) ||
        o.nombreCliente.toLowerCase().includes(q) ||
        o.emailCliente.toLowerCase().includes(q)
      );
    });
  }, [orders, searchQuery, selectedStatus]);

  const counts = {
    total: orders.length,
    pendientes: orders.filter((o) => o.estado === 'PENDIENTE').length,
    pagados: orders.filter((o) => o.estado === 'PAGADO').length,
    enviados: orders.filter((o) => o.estado === 'ENVIADO').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-600 mt-1">Gestiona todos los pedidos de la tienda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Pedidos" value={counts.total} color="text-gray-900" />
        <StatCard label="Pendientes" value={counts.pendientes} color="text-yellow-600" />
        <StatCard label="Pagados" value={counts.pagados} color="text-green-600" />
        <StatCard label="Enviados" value={counts.enviados} color="text-purple-600" />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              maxLength={100}
              placeholder="Buscar por número de pedido, nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'TODOS' | OrderStatus)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] appearance-none"
            >
              <option value="TODOS">Todos los estados</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#9146FF]" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Pedido</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Items</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#9146FF]">#{order.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{order.nombreCliente}</div>
                      <div className="text-sm text-gray-500">{order.emailCliente}</div>
                      {!order.usuarioId && (
                        <div className="text-xs text-gray-400 italic mt-0.5">Invitado</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {new Date(order.fechaCreacion).toLocaleDateString('es-CO')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-semibold text-gray-900">{formatPrice(order.total)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                        <Package className="w-4 h-4" />
                        {itemCount(order)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <select
                          value={order.estado}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-none cursor-pointer disabled:opacity-50 disabled:cursor-wait ${
                            STATUS_COLORS[order.estado]
                          }`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {updatingId === order.id && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <a
                          href={`https://wa.me/${order.telefonoCliente.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 text-green-600" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {orders.length === 0
                        ? 'Aún no hay pedidos registrados'
                        : 'No hay pedidos que coincidan con los filtros'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pedido #{order.id}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(order.fechaCreacion).toLocaleString('es-CO')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <Section title="Cliente">
            <Field label="Nombre" value={order.nombreCliente} />
            <Field label="Email" value={order.emailCliente} />
            <Field label="Teléfono" value={order.telefonoCliente} />
            {!order.usuarioId && (
              <p className="text-xs text-gray-500 italic">Pedido como invitado (sin cuenta)</p>
            )}
          </Section>

          <Section title="Envío">
            <Field label="Dirección" value={order.direccionEnvio} />
            {order.ciudadEnvio && <Field label="Ciudad" value={order.ciudadEnvio} />}
            {order.departamentoEnvio && (
              <Field label="Departamento" value={order.departamentoEnvio} />
            )}
            {order.paisEnvio && <Field label="País" value={order.paisEnvio} />}
            {order.codigoPostalEnvio && (
              <Field label="Código postal" value={order.codigoPostalEnvio} />
            )}
            {order.detallesAdicionales && (
              <Field label="Detalles adicionales" value={order.detallesAdicionales} />
            )}
          </Section>

          <Section title="Productos">
            <div className="space-y-3">
              {order.items.map((it) => (
                <div
                  key={it.id}
                  className="flex justify-between items-center bg-gray-50 rounded-lg p-3"
                >
                  <div>
                    <div className="font-semibold text-gray-900">
                      {it.producto?.nombre ?? `Producto #${it.productoId}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatPrice(it.precio)} × {it.cantidad}
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {formatPrice(Number(it.precio) * it.cantidad)}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-200">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg text-[#9146FF]">{formatPrice(order.total)}</span>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </div>
  );
}
