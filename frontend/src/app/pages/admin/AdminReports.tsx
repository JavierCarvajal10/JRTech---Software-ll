import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Download,
  Loader2,
  Inbox,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { listOrders, type Order } from '../../api/orders';
import { listUsers } from '../../api/users';

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const toNumber = (v: string | number | null | undefined): number =>
  typeof v === 'number' ? v : Number(v) || 0;

// Una orden cuenta como "venta efectiva" si NO está cancelada.
const isEffectiveSale = (o: Order) => o.estado !== 'CANCELADO';

const formatPct = (n: number): string =>
  `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

export function AdminReports() {
  const ordersQuery = useQuery({
    queryKey: ['admin', 'reports', 'orders'],
    queryFn: () => listOrders(),
  });
  const usersQuery = useQuery({
    queryKey: ['admin', 'reports', 'users'],
    queryFn: () => listUsers(),
  });

  const orders = ordersQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const loading = ordersQuery.isLoading || usersQuery.isLoading;
  const noData = !loading && orders.length === 0;

  // --- Métricas globales -------------------------------------------------
  const metrics = useMemo(() => {
    const effective = orders.filter(isEffectiveSale);
    const revenue = effective.reduce((s, o) => s + toNumber(o.total), 0);
    const salesCount = effective.length;
    const avgTicket = salesCount ? revenue / salesCount : 0;

    // Nuevos clientes (rol CLIENTE) en los últimos 30 días.
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - THIRTY_DAYS;
    const newClients = users.filter(
      (u) => u.rol === 'CLIENTE' && new Date(u.fechaCreacion).getTime() >= cutoff
    ).length;

    // Cambio mes actual vs mes anterior (ingresos y cantidad de ventas).
    const now = new Date();
    const ymKey = (d: Date) => d.getFullYear() * 12 + d.getMonth();
    const thisM = ymKey(now);
    let curRev = 0,
      prevRev = 0,
      curCnt = 0,
      prevCnt = 0;
    for (const o of effective) {
      const m = ymKey(new Date(o.fechaCreacion));
      const total = toNumber(o.total);
      if (m === thisM) {
        curRev += total;
        curCnt += 1;
      } else if (m === thisM - 1) {
        prevRev += total;
        prevCnt += 1;
      }
    }
    const pctChange = (curr: number, prev: number) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

    return {
      revenue,
      salesCount,
      avgTicket,
      newClients,
      revChange: pctChange(curRev, prevRev),
      salesChange: pctChange(curCnt, prevCnt),
    };
  }, [orders, users]);

  // --- Top productos por unidades vendidas ------------------------------
  const topProducts = useMemo(() => {
    const map = new Map<number, { name: string; sales: number; revenue: number }>();
    for (const o of orders) {
      if (!isEffectiveSale(o)) continue;
      for (const it of o.items) {
        const id = it.productoId;
        const name = it.producto?.nombre ?? `Producto #${id}`;
        const lineRev = toNumber(it.precio) * it.cantidad;
        const acc = map.get(id) ?? { name, sales: 0, revenue: 0 };
        acc.sales += it.cantidad;
        acc.revenue += lineRev;
        map.set(id, acc);
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [orders]);

  // --- Top clientes por monto total gastado ------------------------------
  const topClients = useMemo(() => {
    const map = new Map<
      string,
      { name: string; purchases: number; total: number }
    >();
    for (const o of orders) {
      if (!isEffectiveSale(o)) continue;
      // Agrupamos por usuarioId si existe (cliente registrado) o por email
      // si fue compra de invitado.
      const key = o.usuarioId ? `id-${o.usuarioId}` : `email-${o.emailCliente}`;
      const name = o.usuario
        ? `${o.usuario.primerNombre} ${o.usuario.primerApellido}`
        : o.nombreCliente;
      const acc = map.get(key) ?? { name, purchases: 0, total: 0 };
      acc.purchases += 1;
      acc.total += toNumber(o.total);
      map.set(key, acc);
    }
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [orders]);

  // --- Serie mensual (últimos 6 meses) para la gráfica ------------------
  const monthlySeries = useMemo(() => {
    const now = new Date();
    const buckets: { label: string; key: string; ingresos: number; ventas: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d
        .toLocaleDateString('es-CO', { month: 'short' })
        .replace('.', '');
      buckets.push({ key, label, ingresos: 0, ventas: 0 });
    }
    for (const o of orders) {
      if (!isEffectiveSale(o)) continue;
      const d = new Date(o.fechaCreacion);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) {
        bucket.ingresos += toNumber(o.total);
        bucket.ventas += 1;
      }
    }
    return buckets;
  }, [orders]);

  // --- Exportar a CSV (órdenes) -----------------------------------------
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const header = ['ID', 'Fecha', 'Estado', 'Cliente', 'Email', 'Items', 'Total (COP)'];
    const rows = orders.map((o) => [
      o.id,
      new Date(o.fechaCreacion).toISOString(),
      o.estado,
      o.nombreCliente,
      o.emailCliente,
      o.items.reduce((s, it) => s + it.cantidad, 0),
      toNumber(o.total),
    ]);
    const csv = [header, ...rows]
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
    // El BOM ﻿ hace que Excel detecte UTF-8 y muestre tildes correctamente.
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordenes-jrtech-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Render -----------------------------------------------------------
  const metricCards = [
    {
      title: 'Ingresos totales',
      value: copFormatter.format(metrics.revenue),
      change: metrics.revChange,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total ventas',
      value: metrics.salesCount.toLocaleString('es-CO'),
      change: metrics.salesChange,
      icon: ShoppingBag,
      color: 'text-[#9146FF]',
      bgColor: 'bg-[#F5F0FF]',
    },
    {
      title: 'Nuevos clientes (30d)',
      value: metrics.newClients.toLocaleString('es-CO'),
      change: null,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Ticket promedio',
      value: copFormatter.format(metrics.avgTicket),
      change: null,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-1">
            Métricas calculadas a partir de las órdenes (excluye canceladas)
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={orders.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          Exportar CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#9146FF]" />
        </div>
      ) : noData ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Aún no hay órdenes registradas
          </h3>
          <p className="text-gray-600">
            Cuando se realice una venta, los datos aparecerán aquí automáticamente.
          </p>
        </div>
      ) : (
        <>
          {/* Tarjetas de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricCards.map((m) => {
              const Icon = m.icon;
              const isPositive = m.change !== null && m.change >= 0;
              return (
                <div
                  key={m.title}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">{m.title}</p>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {m.value}
                      </h3>
                      {m.change !== null && (
                        <div
                          className={`text-sm font-semibold ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}
                          title="Cambio vs mes anterior"
                        >
                          {formatPct(m.change)} vs mes anterior
                        </div>
                      )}
                    </div>
                    <div
                      className={`w-12 h-12 rounded-lg ${m.bgColor} flex items-center justify-center`}
                    >
                      <Icon className={`w-6 h-6 ${m.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráfica de ventas por mes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Ingresos por mes (últimos 6)
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(v) =>
                      v >= 1_000_000
                        ? `${(v / 1_000_000).toFixed(1)}M`
                        : v >= 1_000
                        ? `${(v / 1_000).toFixed(0)}k`
                        : String(v)
                    }
                  />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      name === 'ingresos'
                        ? [copFormatter.format(value), 'Ingresos']
                        : [value, 'Ventas']
                    }
                    labelStyle={{ color: '#111827', fontWeight: 600 }}
                  />
                  <Bar dataKey="ingresos" fill="#9146FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top productos y clientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Productos más vendidos
              </h2>
              {topProducts.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">Aún no hay ventas.</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p, i) => (
                    <div
                      key={p.name + i}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#9146FF] to-[#772CE8] rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {p.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {p.sales.toLocaleString('es-CO')} unidades
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-[#9146FF] whitespace-nowrap ml-2">
                        {copFormatter.format(p.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Clientes más activos
              </h2>
              {topClients.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">Aún no hay clientes con compras.</p>
              ) : (
                <div className="space-y-3">
                  {topClients.map((c, i) => (
                    <div
                      key={c.name + i}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#9146FF] to-[#772CE8] rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {c.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {c.purchases.toLocaleString('es-CO')} compras
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-[#9146FF] whitespace-nowrap ml-2">
                        {copFormatter.format(c.total)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
