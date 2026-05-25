import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  Monitor,
  HardDrive,
  Zap,
  Box,
  Fan,
  Package,
  Check,
  Plus,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  fetchProductsBySubcategoria,
  setProductBajoImportacion,
  type Product,
} from '../../api/products';
import { useCreateProduct } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useToast } from '../../context/ToastContext';
import { FIELD_LIMITS, PATTERNS, MESSAGES } from '../../lib/validation';

interface Subcat {
  nombre: string;
  icon: React.ElementType;
}

// Subcategorías de "Componentes PC" en la BD.
const SUBCATS: Subcat[] = [
  { nombre: 'Procesadores', icon: Cpu },
  { nombre: 'Boards', icon: CircuitBoard },
  { nombre: 'RAM', icon: MemoryStick },
  { nombre: 'GPU Gráficas', icon: Monitor },
  { nombre: 'Almacenamiento', icon: HardDrive },
  { nombre: 'Fuentes de poder', icon: Zap },
  { nombre: 'Gabinetes', icon: Box },
  { nombre: 'Refri. líquida y aire', icon: Fan },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);

interface ComponentFormValues {
  nombre: string;
  precio: number;
  stock: number;
  descripcion: string;
  imagenUrl: string;
  bajoImportacion: boolean;
}

export function AdminPCBuilder() {
  const { showToast } = useToast();
  const [selected, setSelected] = useState<string>(SUBCATS[0].nombre);
  const [products, setProducts] = useState<Product[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  const { data: categories = [] } = useCategories();
  const createMutation = useCreateProduct();

  // categoriaId de la subcategoría activa: por convención, todas las subcats
  // del PC Builder cuelgan del padre "Componentes PC". Resolvemos por nombre.
  const selectedCategoryId = useMemo(() => {
    const match = categories.find(
      (c) => c.name === selected && c.parentName === 'Componentes PC'
    );
    return match?.id ?? null;
  }, [categories, selected]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComponentFormValues>({
    defaultValues: {
      nombre: '',
      precio: 0,
      stock: 0,
      descripcion: '',
      imagenUrl: '',
      bajoImportacion: false,
    },
  });

  // Carga conteo de cada subcategoría (una vez al montar)
  useEffect(() => {
    let cancelled = false;
    async function loadCounts() {
      try {
        const results = await Promise.all(
          SUBCATS.map((s) =>
            fetchProductsBySubcategoria(s.nombre).then(
              (items) => [s.nombre, items.length] as const
            )
          )
        );
        if (!cancelled) setCounts(Object.fromEntries(results));
      } catch {
        // silent — los counts son cosméticos
      }
    }
    loadCounts();
    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  // Carga productos de la subcategoría seleccionada
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const items = await fetchProductsBySubcategoria(selected);
        if (!cancelled) setProducts(items);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Error cargando productos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selected, reloadTick]);

  const handleOpenCreate = () => {
    reset({
      nombre: '',
      precio: 0,
      stock: 0,
      descripcion: '',
      imagenUrl: '',
      bajoImportacion: false,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    reset();
    setModalOpen(false);
  };

  const onSubmit = async (values: ComponentFormValues) => {
    if (!selectedCategoryId) {
      showToast(
        `No se encontró la subcategoría "${selected}" bajo "Componentes PC". Crea las categorías base primero.`
      );
      return;
    }
    try {
      await createMutation.mutateAsync({
        nombre: values.nombre,
        descripcion: values.descripcion || null,
        precio: Number(values.precio),
        stock: Number(values.stock),
        categoriaId: selectedCategoryId,
        bajoImportacion: Boolean(values.bajoImportacion),
        imagenes: values.imagenUrl ? [values.imagenUrl] : [],
      });
      showToast(`Componente "${values.nombre}" agregado a ${selected}`);
      closeModal();
      setReloadTick((t) => t + 1);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error creando componente';
      showToast(msg);
    }
  };

  const handleToggleImportacion = async (p: Product) => {
    setTogglingId(p.id);
    try {
      const updated = await setProductBajoImportacion(p.id, !p.bajoImportacion);
      setProducts((prev) =>
        prev.map((x) =>
          x.id === p.id ? { ...x, bajoImportacion: updated.bajoImportacion } : x
        )
      );
      showToast(
        updated.bajoImportacion
          ? `"${p.name}" marcado como bajo importación`
          : `"${p.name}" marcado como disponible regular`
      );
    } catch (err) {
      showToast(
        err instanceof Error ? `Error: ${err.message}` : 'Error actualizando producto'
      );
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Arma tu PC — Componentes</h1>
          <p className="text-gray-600 mt-1">
            Gestiona el catálogo de componentes que aparece en la sección "Arma tu PC". Marca como{' '}
            <span className="font-semibold text-amber-700">bajo importación</span> los productos
            que no tienes en stock para que el cliente solicite cotización.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Agregar componente
        </button>
      </div>

      {/* Subcategorías */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        {SUBCATS.map((s) => {
          const Icon = s.icon;
          const isActive = selected === s.nombre;
          return (
            <button
              key={s.nombre}
              onClick={() => setSelected(s.nombre)}
              className={`p-3 rounded-xl border-2 transition-all ${
                isActive
                  ? 'bg-[#F5F0FF] border-[#9146FF] text-[#9146FF]'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-[#BF94FF]'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-semibold leading-tight">{s.nombre}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                {counts[s.nombre] ?? '…'} items
              </div>
            </button>
          );
        })}
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{selected}</h2>
          <span className="text-sm text-gray-500">
            {products.length} producto{products.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando...
          </div>
        )}

        {error && !loading && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No hay productos en esta subcategoría.
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Componente
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      {p.description && (
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-gray-900">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-sm font-semibold ${
                          p.stock > 0 ? 'text-green-700' : 'text-gray-400'
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.bajoImportacion ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                          <Package className="w-3 h-3" />
                          Bajo importación
                        </span>
                      ) : p.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                          <Check className="w-3 h-3" />
                          En stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-1 rounded-full">
                          Agotado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleImportacion(p)}
                        disabled={togglingId === p.id}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${
                          p.bajoImportacion
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >
                        {togglingId === p.id ? (
                          <Loader2 className="w-3 h-3 animate-spin inline" />
                        ) : p.bajoImportacion ? (
                          'Marcar disponible'
                        ) : (
                          'Marcar bajo importación'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        <p className="font-semibold mb-1">¿Cómo funciona?</p>
        <ul className="list-disc pl-5 space-y-1 text-blue-800">
          <li>Productos <strong>en stock</strong> aparecen en "Arma tu PC" y se compran normalmente.</li>
          <li>Productos <strong>bajo importación</strong> aparecen con etiqueta naranja. El cliente puede agregarlos a su build pero al confirmar se genera una solicitud en <em>Importaciones</em> para que tú envíes cotización por WhatsApp.</li>
          <li>Las solicitudes auto-generadas desde el builder aparecen en <strong>Admin → Importaciones</strong> con vínculo directo al producto del catálogo.</li>
          <li>Tip: también puedes crear componentes desde <strong>Admin → Productos</strong> asignando una subcategoría de "Componentes PC"; aparecerán automáticamente aquí.</li>
        </ul>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Agregar componente</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Subcategoría: <span className="font-semibold text-[#9146FF]">{selected}</span>
                  {selectedCategoryId === null && (
                    <span className="ml-2 text-red-600">
                      (no encontrada en BD)
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  {...register('nombre', {
                    required: 'El nombre es obligatorio',
                    maxLength: { value: FIELD_LIMITS.productName, message: MESSAGES.maxLength(FIELD_LIMITS.productName) },
                  })}
                  maxLength={FIELD_LIMITS.productName}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF]"
                  placeholder="AMD Ryzen 7 7800X3D"
                />
                {errors.nombre && (
                  <p className="text-red-600 text-sm mt-1">{errors.nombre.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Precio (COP) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register('precio', {
                      required: 'El precio es obligatorio',
                      min: { value: 0, message: 'Mínimo 0' },
                      max: { value: 999999999, message: 'Precio demasiado alto' },
                      valueAsNumber: true,
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF]"
                  />
                  {errors.precio && (
                    <p className="text-red-600 text-sm mt-1">{errors.precio.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    {...register('stock', {
                      min: { value: 0, message: 'Mínimo 0' },
                      max: { value: 1000000, message: 'Stock demasiado alto' },
                      valueAsNumber: true,
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF]"
                  />
                  {errors.stock && (
                    <p className="text-red-600 text-sm mt-1">{errors.stock.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  URL de imagen
                </label>
                <input
                  {...register('imagenUrl', {
                    maxLength: { value: FIELD_LIMITS.url, message: MESSAGES.maxLength(FIELD_LIMITS.url) },
                    pattern: { value: PATTERNS.url, message: MESSAGES.url },
                  })}
                  maxLength={FIELD_LIMITS.url}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF]"
                  placeholder="https://..."
                />
                {errors.imagenUrl && (
                  <p className="text-red-600 text-sm mt-1">{errors.imagenUrl.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  {...register('descripcion', {
                    maxLength: { value: FIELD_LIMITS.productDescription, message: MESSAGES.maxLength(FIELD_LIMITS.productDescription) },
                  })}
                  maxLength={FIELD_LIMITS.productDescription}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] resize-none"
                />
                {errors.descripcion && (
                  <p className="text-red-600 text-sm mt-1">{errors.descripcion.message}</p>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('bajoImportacion')}
                    className="mt-1 w-4 h-4 accent-amber-600 cursor-pointer"
                  />
                  <div>
                    <div className="text-sm font-semibold text-amber-900">
                      Producto bajo importación
                    </div>
                    <div className="text-xs text-amber-800">
                      Si está marcado, NO aparece en el catálogo general. Solo aparece
                      en "Arma tu PC" con etiqueta naranja y genera solicitud de cotización.
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    createMutation.isPending ||
                    selectedCategoryId === null
                  }
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-60"
                >
                  {(isSubmitting || createMutation.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Guardar componente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
