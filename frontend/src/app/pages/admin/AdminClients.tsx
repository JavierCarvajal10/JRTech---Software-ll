import { useEffect, useMemo, useState } from 'react';
import { Search, Mail, Phone, Loader2 } from 'lucide-react';
import { listUsers, type AdminUser } from '../../api/users';
import { listOrders, type Order } from '../../api/orders';
import { friendlyErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/admin/ErrorState';

interface ClientWithStats extends AdminUser {
  purchases: number;
  totalSpent: number;
  lastOrder: string | null;
}

const formatPrice = (n: number) => `$${n.toLocaleString('es-CO')}`;

export function AdminClients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([listUsers('CLIENTE'), listOrders()])
      .then(([u, o]) => {
        if (!cancelled) {
          setUsers(u);
          setOrders(o);
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

  const clients: ClientWithStats[] = useMemo(() => {
    const billable = orders.filter((o) => o.estado !== 'CANCELADO');
    return users.map((u) => {
      const userOrders = billable.filter(
        (o) =>
          o.usuarioId === u.id ||
          o.emailCliente.toLowerCase() === u.email.toLowerCase()
      );
      const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total), 0);
      const lastOrder = userOrders[0]?.fechaCreacion ?? null;
      return {
        ...u,
        purchases: userOrders.length,
        totalSpent,
        lastOrder,
      };
    });
  }, [users, orders]);

  const filtered = clients.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.email.toLowerCase().includes(q) ||
      c.primerNombre.toLowerCase().includes(q) ||
      c.primerApellido.toLowerCase().includes(q) ||
      (c.telefono?.toLowerCase().includes(q) ?? false)
    );
  });

  const activeClients = clients.filter((c) => c.purchases > 0).length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-600 mt-1">Usuarios registrados con rol CLIENTE</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total clientes" value={String(clients.length)} color="text-gray-900" />
        <StatCard
          label="Clientes con compras"
          value={String(activeClients)}
          color="text-green-600"
        />
        <StatCard
          label="Ingresos totales"
          value={formatPrice(totalRevenue)}
          color="text-[#9146FF]"
        />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="relative">
          <input
            type="text"
            maxLength={100}
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#9146FF]" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contacto</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Compras</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Total gastado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Último pedido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {client.primerNombre} {client.primerApellido}
                      </div>
                      <div className="text-sm text-gray-500">ID: {client.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {client.email}
                        </div>
                        {client.telefono && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {client.telefono}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-gray-900">{client.purchases}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-[#9146FF]">
                        {formatPrice(client.totalSpent)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {client.lastOrder
                          ? new Date(client.lastOrder).toLocaleDateString('es-CO')
                          : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {clients.length === 0
                        ? 'Aún no hay clientes registrados'
                        : 'No hay clientes que coincidan'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
