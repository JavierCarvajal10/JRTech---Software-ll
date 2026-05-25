import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  SlidersHorizontal,
  ShoppingCart,
  Heart,
  X,
  Loader2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { buildCategoryTree } from '../api/categories';

interface CatalogProduct {
  id: number;
  name: string;
  category: string;
  categoryParent: string | null;
  price: number;
  image: string;
  stock: number;
  hasImage: boolean;
}

export function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const subcategoryParam = searchParams.get('subcategory');
  const searchParam = searchParams.get('search');
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [viewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'Todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(subcategoryParam);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  const { data: backendProducts = [], isLoading, isError, error } = useProducts();
  const { data: categories = [] } = useCategories();

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('Todos');
    }
    setSelectedSubcategory(subcategoryParam);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryParam, subcategoryParam]);

  const productsData: CatalogProduct[] = useMemo(
    () =>
      backendProducts.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        categoryParent: p.categoryParent,
        price: p.price,
        image: p.image,
        stock: p.stock,
        hasImage: p.hasImage,
      })),
    [backendProducts]
  );

  const filteredProducts = useMemo(() => {
    let result =
      selectedCategory === 'Todos'
        ? productsData
        : productsData.filter(
            (p) =>
              p.categoryParent === selectedCategory ||
              p.category === selectedCategory
          );

    if (selectedSubcategory) {
      result = result.filter((p) => p.category === selectedSubcategory);
    }

    if (searchParam && searchParam.trim()) {
      const query = searchParam.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.categoryParent ?? '').toLowerCase().includes(query)
      );
    }

    // Productos con imagen real primero; los del placeholder van al final.
    // Sort estable: en empate respetamos el orden del backend (más nuevo primero).
    return result
      .map((p, i) => ({ p, i }))
      .sort((a, b) => {
        if (a.p.hasImage !== b.p.hasImage) return a.p.hasImage ? -1 : 1;
        return a.i - b.i;
      })
      .map(({ p }) => p);
  }, [productsData, selectedCategory, selectedSubcategory, searchParam]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const products = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubcategory, searchParam]);

  const clearFilters = () => {
    setSearchParams({});
    setSelectedCategory('Todos');
    setSelectedSubcategory(null);
  };

  const productCountByParent = useMemo(() => {
    const map = new Map<string, number>();
    productsData.forEach((p) => {
      const key = p.categoryParent ?? p.category;
      if (key) map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [productsData]);

  const productCountBySubcategory = useMemo(() => {
    const map = new Map<string, number>();
    productsData.forEach((p) => {
      if (p.category) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    });
    return map;
  }, [productsData]);

  const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')}`;

  const ProductCard = ({ product }: { product: CatalogProduct }) => (
    <div className="bg-white rounded-xl border-2 border-gray-200 hover:border-[#9146FF] hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col">
      <Link to={`/producto/${product.id}`} className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden block">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-md opacity-0 group-hover:opacity-100 z-10">
        <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
      </button>

      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs font-semibold text-[#9146FF] mb-1">{product.category}</div>
        <Link to={`/producto/${product.id}`}>
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] hover:text-[#9146FF] transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mb-3">
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
          </span>
        </div>

        <button
          onClick={() => {
            addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image
            });
            showToast(product.name);
          }}
          disabled={product.stock === 0}
          className="w-full mt-auto flex items-center justify-center gap-2 px-4 py-3 bg-[#9146FF] text-white rounded-lg font-semibold hover:bg-[#772CE8] transition-all shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-5 h-5" />
          Agregar al carrito
        </button>
      </div>
    </div>
  );

  return (
    <section className="w-full bg-white py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Catálogo de <span className="text-[#9146FF]">productos</span>
          </h1>
          <p className="text-gray-600">Descubre nuestra selección completa de tecnología</p>

          {(selectedCategory !== 'Todos' || selectedSubcategory) && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-gray-600">Mostrando:</span>
              <div className="flex items-center gap-2">
                {selectedCategory !== 'Todos' && (
                  <>
                    <span className="font-semibold text-[#9146FF]">{selectedCategory}</span>
                    {selectedSubcategory && (
                      <>
                        <span className="text-gray-400">&gt;</span>
                        <span className="font-semibold text-[#9146FF]">{selectedSubcategory}</span>
                      </>
                    )}
                  </>
                )}
                <button
                  onClick={clearFilters}
                  className="ml-2 text-gray-600 hover:text-[#9146FF] underline transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          <div className={`
            fixed lg:sticky top-0 lg:top-40 left-0 h-screen lg:h-fit lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto w-80 lg:w-64
            bg-white border-2 border-gray-200 rounded-xl p-6
            lg:block lg:flex-shrink-0
            transition-transform duration-300 z-50 lg:z-10
            ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h3 className="font-bold text-gray-900 text-lg">Filtros</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <h3 className="font-bold text-gray-900 mb-4 hidden lg:block">Filtros</h3>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Categorías</h4>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory('Todos');
                    setSelectedSubcategory(null);
                    setSearchParams({});
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-all font-medium ${
                    selectedCategory === 'Todos'
                      ? 'bg-[#9146FF] text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Todos</span>
                    <span className="text-sm opacity-75">{productsData.length}</span>
                  </div>
                </button>

                {tree.map((node) => {
                  const isParentSelected = selectedCategory === node.parent.name;
                  const parentCount = productCountByParent.get(node.parent.name) ?? 0;
                  return (
                    <div key={node.parent.id}>
                      <button
                        onClick={() => {
                          setSelectedCategory(node.parent.name);
                          setSelectedSubcategory(null);
                          setSearchParams({ category: node.parent.name });
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition-all font-medium flex items-center justify-between ${
                          isParentSelected && !selectedSubcategory
                            ? 'bg-[#9146FF] text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          {isParentSelected ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          {node.parent.name}
                        </span>
                        <span className="text-sm opacity-75">{parentCount}</span>
                      </button>

                      {isParentSelected && node.subcategories.length > 0 && (
                        <div className="ml-6 mt-1 space-y-1">
                          {node.subcategories.map((sub) => {
                            const subCount = productCountBySubcategory.get(sub.name) ?? 0;
                            const isSubSelected = selectedSubcategory === sub.name;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  setSelectedCategory(node.parent.name);
                                  setSelectedSubcategory(sub.name);
                                  setSearchParams({
                                    category: node.parent.name,
                                    subcategory: sub.name,
                                  });
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm flex items-center justify-between ${
                                  isSubSelected
                                    ? 'bg-purple-100 text-[#9146FF] font-semibold'
                                    : 'text-gray-600 hover:bg-purple-50 hover:text-[#9146FF]'
                                }`}
                              >
                                <span>{sub.name}</span>
                                <span className="text-xs opacity-75">{subCount}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Limpiar filtros
            </button>
          </div>

          {showFilters && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowFilters(false)}
            ></div>
          )}

          <div className="flex-grow">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                {isLoading ? 'Cargando…' : (
                  <>Mostrando <span className="font-semibold text-gray-900">{filteredProducts.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredProducts.length)}</span> de <span className="font-semibold text-gray-900">{filteredProducts.length}</span> productos</>
                )}
              </p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#9146FF] text-white rounded-lg font-semibold hover:bg-[#772CE8] transition-all"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filtros
              </button>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center gap-3 text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin text-[#9146FF]" />
                <span>Cargando productos…</span>
              </div>
            ) : isError ? (
              <div className="py-20 text-center text-red-600">
                Error al cargar productos: {error instanceof Error ? error.message : 'desconocido'}
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                No hay productos que coincidan con los filtros.
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'flex flex-col gap-4'
              }>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            currentPage === pageNumber
                              ? 'bg-[#9146FF] text-white'
                              : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                      return <span key={pageNumber} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
