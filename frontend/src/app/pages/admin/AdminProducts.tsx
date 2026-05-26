import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { Search, Plus, Edit, Trash2, Eye, Filter, X, Loader2 } from 'lucide-react';
import {
  useProducts,
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
} from '../../hooks/useProducts';
import type { Product } from '../../api/products';
import { useCategories, useCreateCategory } from '../../hooks/useCategories';
import { buildCategoryTree } from '../../api/categories';
import { useToast } from '../../context/ToastContext';
import { FIELD_LIMITS, PATTERNS, MESSAGES, NUMERIC_LIMITS, blockInvalidNumberKeys } from '../../lib/validation';

interface ProductFormValues {
  nombre: string;
  precio: number;
  stock: number;
  categoriaId: string;
  descripcion: string;
  imagenUrl: string;
  bajoImportacion: boolean;
}

export function AdminProducts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const isEditMode = editingProduct !== null;
  const { showToast } = useToast();

  const { data: products = [], isLoading, isError, error } = useProducts({
    includeOutOfStock: true,
    includeImports: true,
  });
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const createCategoryMutation = useCreateCategory();

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParentId, setNewCategoryParentId] = useState<string>('');

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const parentCategories = useMemo(
    () => categories.filter((c) => c.parentId === null),
    [categories]
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: {
      nombre: '',
      precio: 0,
      stock: 0,
      categoriaId: '',
      descripcion: '',
      imagenUrl: '',
      bajoImportacion: false,
    },
  });

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      const created = await createCategoryMutation.mutateAsync({
        nombre: name,
        categoriaPadreId: newCategoryParentId
          ? Number(newCategoryParentId)
          : null,
      });
      setValue('categoriaId', String(created.id));
      setNewCategoryName('');
      setNewCategoryParentId('');
      setShowNewCategory(false);
      showToast(`Categoría "${created.name}" creada`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error creando categoría';
      showToast(msg);
    }
  };

  const categoryOptions = useMemo(
    () => ['Todos', ...parentCategories.map((c) => c.name)],
    [parentCategories]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'Todos' ||
        p.category === selectedCategory ||
        p.categoryParent === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  const onSubmit = async (values: ProductFormValues) => {
    const payload = {
      nombre: values.nombre,
      descripcion: values.descripcion || null,
      precio: Number(values.precio),
      stock: Number(values.stock),
      categoriaId: values.categoriaId ? Number(values.categoriaId) : null,
      bajoImportacion: Boolean(values.bajoImportacion),
      imagenes: values.imagenUrl ? [values.imagenUrl] : [],
    };

    try {
      if (isEditMode && editingProduct) {
        await updateMutation.mutateAsync({
          id: editingProduct.id,
          input: payload,
        });
        showToast(`Producto "${values.nombre}" actualizado`);
      } else {
        await createMutation.mutateAsync(payload);
        showToast(`Producto "${values.nombre}" creado`);
      }
      closeModal();
    } catch (e) {
      const action = isEditMode ? 'actualizando' : 'creando';
      const msg = e instanceof Error ? e.message : `Error ${action} producto`;
      showToast(msg);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      showToast(`Producto "${name}" eliminado`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error eliminando producto';
      showToast(msg);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    reset({
      nombre: '',
      precio: 0,
      stock: 0,
      categoriaId: '',
      descripcion: '',
      imagenUrl: '',
      bajoImportacion: false,
    });
    setShowNewCategory(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      nombre: product.name,
      precio: product.price,
      stock: product.stock,
      categoriaId: product.categoryId ? String(product.categoryId) : '',
      descripcion: product.description,
      imagenUrl: product.image && product.images.length > 0 ? product.image : '',
      bajoImportacion: product.bajoImportacion,
    });
    setShowNewCategory(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    reset();
    setEditingProduct(null);
    setShowNewCategory(false);
    setNewCategoryName('');
    setNewCategoryParentId('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-1">Gestiona el catálogo de productos</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Agregar Producto
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              maxLength={FIELD_LIMITS.searchQuery}
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
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#9146FF]" />
            <span>Cargando productos…</span>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600">
            Error al cargar productos: {error instanceof Error ? error.message : 'desconocido'}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No hay productos que coincidan con los filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Producto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Categoría</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Precio</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const status = product.stock === 0 ? 'Agotado' : 'Activo';
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {product.categoryParent
                            ? `${product.categoryParent} › ${product.category}`
                            : product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          ${product.price.toLocaleString('es-CO')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${product.stock === 0 ? 'text-red-600' : product.stock < 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          status === 'Activo'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/producto/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Ver en la tienda"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-[#9146FF]" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deleteMutation.isPending}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{filteredProducts.length}</span> de <span className="font-semibold">{products.length}</span> productos
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? 'Editar Producto' : 'Agregar Producto'}
                </h2>
                {isEditMode && editingProduct && (
                  <p className="text-sm text-gray-500 mt-1">ID: {editingProduct.id}</p>
                )}
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
                  placeholder="iPhone 15 Pro Max 256GB"
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
                    step="1"
                    min={NUMERIC_LIMITS.priceCOP.min}
                    max={NUMERIC_LIMITS.priceCOP.max}
                    onKeyDown={blockInvalidNumberKeys()}
                    onWheel={(e) => e.currentTarget.blur()}
                    {...register('precio', {
                      required: 'El precio es obligatorio',
                      min: { value: NUMERIC_LIMITS.priceCOP.min, message: MESSAGES.nonNegative },
                      max: { value: NUMERIC_LIMITS.priceCOP.max, message: MESSAGES.max(NUMERIC_LIMITS.priceCOP.max) },
                      validate: (v) =>
                        (Number.isInteger(v) && v >= 0) || MESSAGES.integer,
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
                    step="1"
                    min={NUMERIC_LIMITS.stock.min}
                    max={NUMERIC_LIMITS.stock.max}
                    onKeyDown={blockInvalidNumberKeys()}
                    onWheel={(e) => e.currentTarget.blur()}
                    {...register('stock', {
                      min: { value: NUMERIC_LIMITS.stock.min, message: MESSAGES.nonNegative },
                      max: { value: NUMERIC_LIMITS.stock.max, message: MESSAGES.max(NUMERIC_LIMITS.stock.max) },
                      validate: (v) =>
                        v === undefined || v === null || Number.isNaN(v) ||
                        (Number.isInteger(v) && v >= 0) || MESSAGES.integer,
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Categoría / Subcategoría
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory((v) => !v)}
                    className="text-sm text-[#9146FF] hover:text-[#772CE8] font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Nueva subcategoría
                  </button>
                </div>
                <select
                  {...register('categoriaId')}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF]"
                >
                  <option value="">Sin categoría</option>
                  {categoryTree.map((node) => (
                    <optgroup key={node.parent.id} label={node.parent.name}>
                      <option value={node.parent.id}>
                        {node.parent.name} (general)
                      </option>
                      {node.subcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Tip: asignar una subcategoría hace que el producto aparezca en los filtros de la home y del catálogo.
                </p>

                {showNewCategory && (
                  <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-2">
                    <select
                      value={newCategoryParentId}
                      onChange={(e) => setNewCategoryParentId(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF]"
                    >
                      <option value="">Categoría principal (sin padre)</option>
                      {parentCategories.map((p) => (
                        <option key={p.id} value={p.id}>
                          Subcategoría de "{p.name}"
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreateCategory();
                          }
                        }}
                        maxLength={FIELD_LIMITS.categoryName}
                        placeholder="Nombre"
                        className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF]"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                        className="px-4 py-2 bg-[#9146FF] text-white rounded-lg font-semibold hover:bg-[#772CE8] transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {createCategoryMutation.isPending && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        Crear
                      </button>
                    </div>
                  </div>
                )}
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
                      Si está marcado, este producto NO aparece en el catálogo general.
                      Solo aparece en "Arma tu PC" con etiqueta naranja y genera solicitud
                      de cotización en lugar de venta directa.
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
                    updateMutation.isPending
                  }
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-60"
                >
                  {(isSubmitting ||
                    createMutation.isPending ||
                    updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {isEditMode ? 'Guardar cambios' : 'Guardar producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
