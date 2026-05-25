import { TrendingUp, ShoppingBag, Users, DollarSign, Download } from 'lucide-react';

export function AdminReports() {
  const metrics = [
    {
      title: 'Ingresos Totales',
      value: '$125,890,000',
      change: '+15.3%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Ventas',
      value: '423',
      change: '+8.2%',
      icon: ShoppingBag,
      color: 'text-[#9146FF]',
      bgColor: 'bg-[#F5F0FF]'
    },
    {
      title: 'Nuevos Clientes',
      value: '89',
      change: '+12.5%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Ticket Promedio',
      value: '$2,975,000',
      change: '+5.1%',
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro Max', sales: 87, revenue: '$478,413,000' },
    { name: 'MacBook Pro M3', sales: 64, revenue: '$575,936,000' },
    { name: 'NVIDIA RTX 4090', sales: 45, revenue: '$270,000,000' },
    { name: 'Sony WH-1000XM5', sales: 124, revenue: '$159,960,000' },
    { name: 'Apple Watch Series 9', sales: 98, revenue: '$185,220,000' },
  ];

  const topClients = [
    { name: 'Juan Pérez', purchases: 15, total: '$18,500,000' },
    { name: 'María García', purchases: 12, total: '$15,200,000' },
    { name: 'Carlos López', purchases: 10, total: '$12,800,000' },
    { name: 'Ana Martínez', purchases: 8, total: '$9,600,000' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-1">Analítica y métricas del negocio</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all">
            <Download className="w-5 h-5" />
            Exportar CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white rounded-lg font-semibold hover:shadow-lg transition-all">
            <Download className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</h3>
                  <div className="text-sm text-green-600 font-semibold">{metric.change}</div>
                </div>
                <div className={`w-12 h-12 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ventas por Mes</h2>
        <div className="h-80 bg-gradient-to-br from-[#F5F0FF] to-white rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Gráfica de ventas mensuales - Implementar con Recharts</p>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Productos Más Vendidos</h2>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#9146FF] to-[#772CE8] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.sales} ventas</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#9146FF]">{product.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Clientes Más Activos</h2>
          <div className="space-y-3">
            {topClients.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#9146FF] to-[#772CE8] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-600">{client.purchases} compras</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#9146FF]">{client.total}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Metrics */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Métricas de Conversión</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-2">Tasa de Conversión</div>
            <div className="text-3xl font-bold text-[#9146FF]">3.2%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Tiempo Promedio de Compra</div>
            <div className="text-3xl font-bold text-[#9146FF]">4.5 min</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Carrito Abandonado</div>
            <div className="text-3xl font-bold text-[#9146FF]">12%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
