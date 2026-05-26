import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Eye, MessageCircle, Loader2, X, ExternalLink, Trash2 } from 'lucide-react';
import {
  listImports,
  updateImportStatus,
  deleteImport,
  IMPORT_STATUSES,
  IMPORT_STATUS_LABELS,
  type ImportRequest,
  type ImportStatus,
} from '../../api/imports';
import { friendlyErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { ErrorState } from '../../components/admin/ErrorState';

const STATUS_COLORS: Record<ImportStatus, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  EN_PROCESO: 'bg-blue-100 text-blue-800',
  COTIZADO: 'bg-purple-100 text-purple-800',
  CERRADO: 'bg-gray-100 text-gray-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

const formatBudget = (value: number | string | null) => {
  if (value == null || value === '') return '—';
  return `$${Number(value).toLocaleString('es-CO')}`;
};

export function AdminImports() {
  const { showSuccess, showError } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'TODOS' | ImportStatus>('TODOS');
  const [imports, setImports] = useState<ImportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ImportRequest | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listImports();
      setImports(data);
    } catch (e) {
      setError(friendlyErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleStatusChange = async (id: number, estado: ImportStatus) => {
    const previous = imports;
    setImports((prev) => prev.map((i) => (i.id === id ? { ...i, estado } : i)));
    if (selected?.id === id) {
      setSelected((prev) => (prev ? { ...prev, estado } : null));
    }
    setUpdatingId(id);

    try {
      await updateImportStatus(id, estado);
      showSuccess('Estado actualizado', `Solicitud #${id} → ${IMPORT_STATUS_LABELS[estado]}`);
    } catch (e) {
      setImports(previous);
      if (selected?.id === id) {
        const original = previous.find((i) => i.id === id);
        if (original) setSelected(original);
      }
      showError('No se pudo actualizar el estado', friendlyErrorMessage(e));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`¿Eliminar la solicitud #${id}? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteImport(id);
      await refresh();
      if (selected?.id === id) setSelected(null);
      showSuccess('Solicitud eliminada', `Se eliminó la solicitud #${id}`);
    } catch (e) {
      showError('No se pudo eliminar', friendlyErrorMessage(e));
    }
  };

  const filtered = useMemo(() => {
    return imports.filter((i) => {
      if (selectedStatus !== 'TODOS' && i.estado !== selectedStatus) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        String(i.id).includes(q) ||
        i.nombre.toLowerCase().includes(q) ||
        i.producto.toLowerCase().includes(q) ||
        i.telefono.includes(q) ||
        (i.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [imports, searchQuery, selectedStatus]);

  const counts = {
    total: imports.length,
    pendientes: imports.filter((i) => i.estado === 'PENDIENTE').length,
    proceso: imports.filter((i) => i.estado === 'EN_PROCESO').length,
    cotizados: imports.filter((i) => i.estado === 'COTIZADO').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Importaciones</h1>
        <p className="text-gray-600 mt-1">Gestiona solicitudes de importación de clientes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total solicitudes" value={counts.total} color="text-gray-900" />
        <StatCard label="Pendientes" value={counts.pendientes} color="text-yellow-600" />
        <StatCard label="En proceso" value={counts.proceso} color="text-blue-600" />
        <StatCard label="Cotizados" value={counts.cotizados} color="text-purple-600" />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              maxLength={100}
              placeholder="Buscar por ID, cliente, producto, teléfono o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'TODOS' | ImportStatus)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] appearance-none"
            >
              <option value="TODOS">Todos los estados</option>
              {IMPORT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {IMPORT_STATUS_LABELS[s]}
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Producto</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Presupuesto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[#9146FF]">#{item.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{item.nombre}</div>
                      <div className="text-sm text-gray-500">{item.telefono}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <span className="text-sm text-gray-900 line-clamp-2">{item.producto}</span>
                      <div className="flex items-center gap-2 mt-1">
                        {item.cantidad && (
                          <span className="text-xs text-gray-500">x{item.cantidad}</span>
                        )}
                        {item.productoId && (
                          <span
                            className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded"
                            title="Solicitud generada automáticamente desde Arma tu PC"
                          >
                            ⚙ PC Builder
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">
                      {formatBudget(item.presupuesto)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {new Date(item.fechaCreacion).toLocaleDateString('es-CO')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <select
                          value={item.estado}
                          disabled={updatingId === item.id}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as ImportStatus)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-none cursor-pointer disabled:opacity-50 disabled:cursor-wait ${
                            STATUS_COLORS[item.estado]
                          }`}
                        >
                          {IMPORT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {IMPORT_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                        {updatingId === item.id && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelected(item)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <a
                          href={`https://wa.me/${item.telefono.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 text-green-600" />
                        </a>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {imports.length === 0
                        ? 'Aún no hay solicitudes de importación'
                        : 'No hay solicitudes que coincidan con los filtros'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <ImportDetailModal item={selected} onClose={() => setSelected(null)} />}
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

function ImportDetailModal({
  item,
  onClose,
}: {
  item: ImportRequest;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Solicitud #{item.id}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(item.fechaCreacion).toLocaleString('es-CO')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <Section title="Cliente">
            <Field label="Nombre" value={item.nombre} />
            <Field label="Teléfono" value={item.telefono} />
            {item.email && <Field label="Email" value={item.email} />}
            {item.ciudad && <Field label="Ciudad" value={item.ciudad} />}
            {item.comoNosConocio && (
              <Field label="¿Cómo nos conoció?" value={item.comoNosConocio} />
            )}
          </Section>

          <Section title="Producto solicitado">
            <Field label="Producto" value={item.producto} />
            {item.cantidad && <Field label="Cantidad" value={String(item.cantidad)} />}
            {item.presupuesto != null && (
              <Field label="Presupuesto estimado" value={formatBudget(item.presupuesto)} />
            )}
            {item.enlaceReferencia && (
              <div className="flex justify-between gap-4 text-sm items-center">
                <span className="text-gray-600">Enlace:</span>
                <a
                  href={item.enlaceReferencia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#9146FF] hover:underline flex items-center gap-1 truncate max-w-xs"
                >
                  <span className="truncate">{item.enlaceReferencia}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>
            )}
            {item.descripcion && (
              <div className="pt-2">
                <div className="text-sm text-gray-600 mb-1">Especificaciones adicionales:</div>
                <div className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                  {item.descripcion}
                </div>
              </div>
            )}
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
