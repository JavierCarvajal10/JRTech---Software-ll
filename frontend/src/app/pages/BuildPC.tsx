import { useEffect, useMemo, useState } from 'react';
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  Monitor,
  HardDrive,
  Zap,
  Box,
  Fan,
  Check,
  AlertCircle,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Package,
  Loader2,
  X,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { fetchProductsBySubcategoria, type Product } from '../api/products';
import { submitImportsFromBuilder } from '../api/imports';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FIELD_LIMITS, PATTERNS, MESSAGES } from '../lib/validation';

interface CategoryDef {
  id: string;
  name: string;
  subcategoria: string;
  icon: React.ReactNode;
}

// Cada slot del builder mapea a UNA subcategoría real del catálogo.
// Si renombras subcategorías en la BD, actualizar aquí.
const CATEGORY_DEFS: CategoryDef[] = [
  { id: 'cpu', name: 'Procesador (CPU)', subcategoria: 'Procesadores', icon: <Cpu className="w-5 h-5" /> },
  { id: 'motherboard', name: 'Tarjeta Madre', subcategoria: 'Boards', icon: <CircuitBoard className="w-5 h-5" /> },
  { id: 'ram', name: 'Memoria RAM', subcategoria: 'RAM', icon: <MemoryStick className="w-5 h-5" /> },
  { id: 'gpu', name: 'Tarjeta Gráfica', subcategoria: 'GPU Gráficas', icon: <Monitor className="w-5 h-5" /> },
  { id: 'storage', name: 'Almacenamiento', subcategoria: 'Almacenamiento', icon: <HardDrive className="w-5 h-5" /> },
  { id: 'psu', name: 'Fuente de Poder', subcategoria: 'Fuentes de poder', icon: <Zap className="w-5 h-5" /> },
  { id: 'case', name: 'Gabinete', subcategoria: 'Gabinetes', icon: <Box className="w-5 h-5" /> },
  { id: 'cooling', name: 'Refrigeración', subcategoria: 'Refri. líquida y aire', icon: <Fan className="w-5 h-5" /> },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);

export function BuildPC() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedComponents, setSelectedComponents] = useState<Record<string, Product>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showWarning, setShowWarning] = useState<{ categoryId: string; componentName: string } | null>(null);

  const [importModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      setLoadError(null);
      try {
        const results = await Promise.all(
          CATEGORY_DEFS.map((c) =>
            fetchProductsBySubcategoria(c.subcategoria).then((items) => [c.id, items] as const)
          )
        );
        if (!cancelled) {
          setProductsByCategory(Object.fromEntries(results));
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'No se pudieron cargar los componentes'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleComponentSelect = (categoryId: string, product: Product) => {
    const current = selectedComponents[categoryId];
    if (current?.id === product.id) {
      const next = { ...selectedComponents };
      delete next[categoryId];
      setSelectedComponents(next);
      setShowWarning(null);
      return;
    }
    if (current) {
      setShowWarning({ categoryId, componentName: current.name });
      setTimeout(() => setShowWarning(null), 3000);
      return;
    }
    setSelectedComponents({ ...selectedComponents, [categoryId]: product });
    setShowWarning(null);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [categoryId]: !expandedCategories[categoryId],
    });
  };

  const selectedList = useMemo(() => Object.values(selectedComponents), [selectedComponents]);

  const { available, importItems } = useMemo(() => {
    const a: Product[] = [];
    const i: Product[] = [];
    for (const p of selectedList) {
      if (p.bajoImportacion) i.push(p);
      else a.push(p);
    }
    return { available: a, importItems: i };
  }, [selectedList]);

  const totalAvailable = available.reduce((sum, p) => sum + p.price, 0);
  const totalImport = importItems.reduce((sum, p) => sum + p.price, 0);
  const totalConfig = totalAvailable + totalImport;

  const handleConfirm = () => {
    if (selectedList.length === 0) return;

    // 1) Agregar al carrito los disponibles
    for (const p of available) {
      addToCart({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
      });
    }

    if (available.length > 0 && importItems.length === 0) {
      showToast(`${available.length} componente(s) agregado(s) al carrito`);
      setSelectedComponents({});
      return;
    }

    // 2) Si hay items bajo importación, abrir modal para solicitar cotización
    if (importItems.length > 0) {
      setImportModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-clip">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-b-2 border-gray-200 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-900">Arma tu PC ideal</h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl">
            Selecciona cada componente y arma tu configuración personalizada. Algunos productos
            de alta gama llegan bajo pedido: te enviamos una cotización por WhatsApp.
          </p>
        </div>
      </div>

      {showWarning && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mx-4 sm:mx-6 mt-6 rounded-r-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <p className="text-orange-800 text-sm sm:text-base">
              Ya tienes <span className="font-bold">{showWarning.componentName}</span> seleccionado en esta categoría.
              Deselecciónalo primero para elegir otro.
            </p>
          </div>
        </div>
      )}

      {loadError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{loadError}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-[400px_1fr] gap-6 lg:gap-8">
          {/* Left: Categories list */}
          <div className="space-y-4">
            <div className="bg-[#F5F0FF] dark:bg-gray-800 rounded-xl p-4 border border-[#BF94FF]/30 dark:border-gray-700">
              <h2 className="font-bold text-lg mb-2 text-gray-900">Tu configuración</h2>
              <div className="text-sm text-gray-600">
                {selectedList.length} de {CATEGORY_DEFS.length} componentes seleccionados
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Cargando componentes...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {CATEGORY_DEFS.map((category) => {
                  const items = productsByCategory[category.id] ?? [];
                  const isExpanded = expandedCategories[category.id];
                  const selected = selectedComponents[category.id];
                  const isSelected = !!selected;

                  return (
                    <div key={category.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className={`w-full p-4 flex items-center justify-between transition-all ${
                          isSelected ? 'bg-[#9146FF] text-white' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={isSelected ? 'text-white' : 'text-[#9146FF]'}>{category.icon}</div>
                          <div className="text-left">
                            <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                              {category.name}
                            </h3>
                            {isSelected && selected && (
                              <span className="text-xs text-white/80">{selected.name}</span>
                            )}
                            {!isSelected && items.length === 0 && (
                              <span className="text-xs text-gray-400">Sin productos cargados</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected && <Check className="w-5 h-5 text-white" />}
                          {isExpanded ? (
                            <ChevronUp className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                          ) : (
                            <ChevronDown className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-3 space-y-2">
                          {items.length === 0 ? (
                            <p className="text-sm text-gray-500 italic px-2 py-3 text-center">
                              No hay productos disponibles en esta categoría todavía.
                            </p>
                          ) : (
                            items.map((p) => {
                              const isComponentSelected = selected?.id === p.id;
                              return (
                                <button
                                  key={p.id}
                                  onClick={() => handleComponentSelect(category.id, p)}
                                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                    isComponentSelected
                                      ? 'border-[#9146FF] bg-[#F5F0FF]'
                                      : 'border-gray-200 hover:border-[#BF94FF] hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-sm text-gray-900">{p.name}</span>
                                    {isComponentSelected && <Check className="w-4 h-4 text-[#9146FF]" />}
                                  </div>
                                  {p.description && (
                                    <p className="text-xs text-gray-600 mb-1 line-clamp-2">{p.description}</p>
                                  )}
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-sm font-bold text-[#9146FF]">{formatPrice(p.price)}</p>
                                    {p.bajoImportacion ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                        <Package className="w-3 h-3" />
                                        Bajo importación
                                      </span>
                                    ) : p.stock > 0 ? (
                                      <span className="text-[10px] font-semibold text-green-700">
                                        ● En stock
                                      </span>
                                    ) : null}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedList.length > 0 && (
              <div className="bg-gradient-to-br from-[#9146FF] to-[#772CE8] rounded-xl p-6 text-white sticky bottom-6 shadow-xl">
                <div className="space-y-1 mb-4 text-sm">
                  {available.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Disponibles en carrito:</span>
                      <span className="font-semibold">{formatPrice(totalAvailable)}</span>
                    </div>
                  )}
                  {importItems.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        Bajo importación (cotización):
                      </span>
                      <span className="font-semibold">~{formatPrice(totalImport)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-white/30">
                    <span className="text-base">Total estimado:</span>
                    <span className="text-xl font-bold">{formatPrice(totalConfig)}</span>
                  </div>
                </div>
                <button
                  onClick={handleConfirm}
                  className="w-full bg-white text-[#9146FF] font-bold py-3 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {importItems.length > 0
                    ? available.length > 0
                      ? 'Confirmar (carrito + cotización)'
                      : 'Solicitar cotización'
                    : 'Agregar todo al carrito'}
                </button>
                {importItems.length > 0 && (
                  <p className="text-xs text-white/80 text-center mt-3">
                    Los componentes bajo importación no se cobran ahora — te enviamos cotización por WhatsApp.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-b-2 border-gray-200 p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Vista previa</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {selectedList.length === 0
                    ? 'Selecciona componentes del menú para visualizarlos'
                    : `${selectedList.length} componente${selectedList.length !== 1 ? 's' : ''} seleccionado${selectedList.length !== 1 ? 's' : ''}`}
                </p>
              </div>

              <div className="p-4 sm:p-8">
                <div className="relative w-full aspect-square max-w-xl mx-auto">
                  {/* Centro: Gabinete */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#0E0E10] border-4 border-gray-300 flex flex-col items-center justify-center shadow-xl z-10">
                    {selectedComponents['case'] ? (
                      <div className="w-full h-full rounded-full overflow-hidden p-2">
                        <ImageWithFallback
                          src={selectedComponents['case'].image}
                          alt="Case"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    ) : (
                      <>
                        <Box className="w-9 h-9 sm:w-16 sm:h-16 text-gray-500 mb-1 sm:mb-2" />
                        <span className="text-[10px] sm:text-xs text-gray-400 text-center px-2 sm:px-4 leading-tight">
                          Gabinete<br />(Case)
                        </span>
                      </>
                    )}
                  </div>

                  {/* Anillos alrededor */}
                  {CATEGORY_DEFS.filter((cat) => cat.id !== 'case').map((category, index, arr) => {
                    const product = selectedComponents[category.id];
                    const angle = (2 * Math.PI * index) / arr.length - Math.PI / 2;
                    const radius = 38;
                    const top = 50 + radius * Math.sin(angle);
                    const left = 50 + radius * Math.cos(angle);

                    return (
                      <div
                        key={category.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ top: `${top}%`, left: `${left}%` }}
                      >
                        <div
                          className={`relative w-14 h-14 sm:w-24 sm:h-24 rounded-full border-4 flex flex-col items-center justify-center shadow-lg transition-all ${
                            product
                              ? product.bajoImportacion
                                ? 'bg-amber-500 border-amber-600'
                                : 'bg-[#9146FF] border-[#772CE8]'
                              : 'bg-[#1a1a2e] border-gray-600'
                          }`}
                        >
                          {product ? (
                            <div className="w-full h-full rounded-full overflow-hidden p-1">
                              <ImageWithFallback
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            </div>
                          ) : (
                            <>
                              <div className="text-gray-400">{category.icon}</div>
                              <span className="hidden sm:block text-[10px] text-gray-400 text-center mt-1 px-2 leading-tight">
                                {category.name}
                              </span>
                            </>
                          )}
                          {product?.bajoImportacion && (
                            <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 border-2 border-amber-500">
                              <Package className="w-3 h-3 text-amber-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedList.length > 0 && (
                  <div className="mt-8 space-y-3">
                    <h3 className="font-bold text-gray-900 mb-3">Componentes seleccionados:</h3>
                    {Object.entries(selectedComponents).map(([categoryId, p]) => {
                      const category = CATEGORY_DEFS.find((c) => c.id === categoryId);
                      return (
                        <div
                          key={categoryId}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            p.bajoImportacion
                              ? 'bg-amber-50 border-amber-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={p.bajoImportacion ? 'text-amber-600' : 'text-[#9146FF]'}>
                              {category?.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-600">{category?.name}</span>
                                {p.bajoImportacion && (
                                  <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                                    <Package className="w-3 h-3" />
                                    Bajo importación
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-gray-900">{formatPrice(p.price)}</p>
                            <button
                              onClick={() => {
                                const next = { ...selectedComponents };
                                delete next[categoryId];
                                setSelectedComponents(next);
                              }}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {importItems.length > 0 && (
              <div className="mt-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Package className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-900 mb-1">
                      {importItems.length} componente(s) bajo importación
                    </h3>
                    <p className="text-sm text-amber-800">
                      Estos no se cobran en el carrito. Al confirmar te pedimos tus datos para enviarte
                      una cotización personalizada por WhatsApp con tiempos de entrega y precio final.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {importModalOpen && (
        <ImportRequestModal
          items={importItems}
          alsoAddedToCart={available.length}
          defaultUser={user}
          onClose={() => setImportModalOpen(false)}
          onSuccess={() => {
            setImportModalOpen(false);
            setSelectedComponents({});
          }}
        />
      )}
    </div>
  );
}

// =============================================================
// Modal: solicitar cotización de productos bajo importación
// =============================================================

interface ImportRequestModalProps {
  items: Product[];
  alsoAddedToCart: number;
  defaultUser: { firstName: string; lastName: string; email: string; phone?: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

function ImportRequestModal({
  items,
  alsoAddedToCart,
  defaultUser,
  onClose,
  onSuccess,
}: ImportRequestModalProps) {
  const { showToast } = useToast();
  const [nombre, setNombre] = useState(
    defaultUser ? `${defaultUser.firstName} ${defaultUser.lastName}`.trim() : ''
  );
  const [telefono, setTelefono] = useState(defaultUser?.phone ?? '');
  const [email, setEmail] = useState(defaultUser?.email ?? '');
  const [ciudad, setCiudad] = useState('');
  const [notas, setNotas] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const totalEstimado = items.reduce((s, p) => s + p.price, 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = MESSAGES.required;
    else if (nombre.length > FIELD_LIMITS.fullName)
      e.nombre = MESSAGES.maxLength(FIELD_LIMITS.fullName);
    if (!telefono.trim()) e.telefono = MESSAGES.required;
    else if (!PATTERNS.phone.test(telefono)) e.telefono = MESSAGES.phone;
    else if (telefono.length > FIELD_LIMITS.phone)
      e.telefono = MESSAGES.maxLength(FIELD_LIMITS.phone);
    if (email.trim()) {
      if (!PATTERNS.email.test(email)) e.email = MESSAGES.email;
      else if (email.length > FIELD_LIMITS.email)
        e.email = MESSAGES.maxLength(FIELD_LIMITS.email);
    }
    if (ciudad.length > FIELD_LIMITS.city)
      e.ciudad = MESSAGES.maxLength(FIELD_LIMITS.city);
    if (notas.length > FIELD_LIMITS.notes)
      e.notas = MESSAGES.maxLength(FIELD_LIMITS.notes);
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitImportsFromBuilder({
        nombre,
        telefono,
        email: email || undefined,
        ciudad: ciudad || undefined,
        notas: notas || undefined,
        productoIds: items.map((p) => p.id),
      });
      const cartMsg = alsoAddedToCart > 0
        ? ` ${alsoAddedToCart} componente(s) ya están en tu carrito.`
        : '';
      showToast(result.message + cartMsg);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error enviando la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Solicitar cotización</h2>
            <p className="text-xs text-gray-500">Te contactamos por WhatsApp</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-amber-900 mb-2">
              Productos bajo importación ({items.length}):
            </p>
            <ul className="space-y-1 text-sm text-amber-800">
              {items.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span className="truncate pr-2">• {p.name}</span>
                  <span className="font-mono text-xs whitespace-nowrap">~{formatPrice(p.price)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-amber-200 mt-2 pt-2 flex items-center justify-between text-sm font-bold text-amber-900">
              <span>Total estimado:</span>
              <span>~{formatPrice(totalEstimado)}</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-2 italic">
              El precio final puede variar según costos de importación, impuestos y disponibilidad
              al momento de la cotización.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (fieldErrors.nombre) setFieldErrors((p) => ({ ...p, nombre: '' }));
                }}
                maxLength={FIELD_LIMITS.fullName}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#9146FF] ${
                  fieldErrors.nombre ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Tu nombre"
              />
              {fieldErrors.nombre && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                WhatsApp / Teléfono *
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => {
                  setTelefono(e.target.value);
                  if (fieldErrors.telefono) setFieldErrors((p) => ({ ...p, telefono: '' }));
                }}
                maxLength={FIELD_LIMITS.phone}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#9146FF] ${
                  fieldErrors.telefono ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="+57 300 123 4567"
              />
              {fieldErrors.telefono && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.telefono}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
                  }}
                  maxLength={FIELD_LIMITS.email}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#9146FF] ${
                    fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="opcional"
                />
                {fieldErrors.email && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ciudad</label>
                <input
                  type="text"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  maxLength={FIELD_LIMITS.city}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#9146FF]"
                  placeholder="opcional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Notas adicionales
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                maxLength={FIELD_LIMITS.notes}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#9146FF]"
                placeholder="¿Algo que quieras especificar? (urgencia, presupuesto, etc.)"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  Enviar solicitud de cotización
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
