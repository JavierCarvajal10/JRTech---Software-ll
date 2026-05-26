import { useEffect, useMemo, useState } from 'react';
import { Search, AlertTriangle, Filter, Loader2 } from 'lucide-react';
import { fetchProducts, type Product } from '../../api/products';
import { friendlyErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/admin/ErrorState';

const LOW_STOCK_THRESHOLD = 5;

export function AdminInventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProducts({ includeOutOfStock: true })
      .then((data) => {
        if (!cancelled) setProducts(data);
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

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.categoryParent) set.add(p.categoryParent);
      else if (p.category && p.category !== 'Sin categoría') set.add(p.category);
    });
    return ['Todos', ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'Todos') {
        const matchesCategory =
          p.categoryParent === selectedCategory || p.category === selectedCategory;
        if (!matchesCategory) return false;
      }
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q);
    });
  }, [products, searchQuery, selectedCategory]);

  const lowStockCount = products.filter((p) => p.stock < LOW_STOCK_THRESHOLD).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
        <p className="text-gray-600 mt-1">Stock disponible de cada producto</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Productos totales</div>
          <div className="text-2xl font-bold text-gray-900">{products.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Stock bajo (&lt; {LOW_STOCK_THRESHOLD})</div>
          <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Sin stock</div>
          <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900">Alerta de Stock Bajo</h3>
              <p className="text-sm text-yellow-700">
                Tienes {lowStockCount} producto{lowStockCount !== 1 ? 's' : ''} con menos de{' '}
                {LOW_STOCK_THRESHOLD} unidades disponibles
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              maxLength={100}
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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
          <ErrorState message={error} onRetry={load} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Producto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Categoría</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Precio</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Stock</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">ID: {item.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.categoryParent ? (
                        <>
                          <div>{item.categoryParent}</div>
                          <div className="text-xs text-gray-500">{item.category}</div>
                        </>
                      ) : (
                        item.category
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      ${item.price.toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`font-bold ${
                          item.stock === 0
                            ? 'text-red-600'
                            : item.stock < LOW_STOCK_THRESHOLD
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          Sin stock
                        </span>
                      ) : item.stock < LOW_STOCK_THRESHOLD ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          Bajo
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {products.length === 0
                        ? 'Aún no hay productos registrados'
                        : 'No hay productos que coincidan con los filtros'}
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
