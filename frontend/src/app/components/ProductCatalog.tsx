import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  Search,
  SlidersHorizontal,
  Grid3x3,
  List,
  ChevronDown,
  Star,
  ShoppingCart,
  Heart,
  X
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { products as allProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  badge?: string;
  badgeColor?: string;
}

export function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const subcategoryParam = searchParams.get('subcategory');
  const searchParam = searchParams.get('search');
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'Todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryParam || null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  // Update selected category and subcategory when URL params change
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('Todos');
    }
    setSelectedSubcategory(subcategoryParam);

    // Scroll to top when filters change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryParam, subcategoryParam]);

  // Transform allProducts to catalog format
  const productsData: Product[] = allProducts.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.images[0],
    rating: p.rating,
    reviews: p.reviews,
    stock: p.stock,
    badge: p.badge,
    badgeColor: p.badgeColor
  }));

  // Filter products based on selected category
  let filteredProducts = selectedCategory === 'Todos'
    ? productsData
    : productsData.filter(p => p.category === selectedCategory);

  // Apply subcategory filter if present
  if (selectedSubcategory) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(selectedSubcategory.toLowerCase())
    );
  }

  // Apply search filter from URL param
  if (searchParam && searchParam.trim()) {
    const query = searchParam.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const products = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubcategory, searchParam]);

  // Clear filters handler
  const clearFilters = () => {
    setSearchParams({});
    setSelectedCategory('Todos');
    setSelectedSubcategory(null);
  };

  // Calculate dynamic category counts
  const categoryCounts: Record<string, number> = {};
  productsData.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  const categories = [
    { name: 'Todos', count: productsData.length },
    { name: 'Apple', count: categoryCounts['Apple'] || 0 },
    { name: 'Componentes PC', count: categoryCounts['Componentes PC'] || 0 },
    { name: 'Audio & Streaming', count: categoryCounts['Audio & Streaming'] || 0 },
    { name: 'Computadores', count: categoryCounts['Computadores'] || 0 },
    { name: 'Accesorios', count: categoryCounts['Accesorios'] || 0 }
  ];

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CO')}`;
  };

  const ProductCard = ({ product, isListView }: { product: Product; isListView: boolean }) => {
    if (isListView) {
      return (
        <div className="bg-white rounded-xl border-2 border-gray-200 hover:border-[#9146FF] transition-all duration-300 overflow-hidden group">
          <div className="flex flex-col sm:flex-row gap-4 p-4">
            {/* Image */}
            <Link to={`/producto/${product.id}`} className="relative w-full sm:w-48 h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.badge && (
                <div
                  className="absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: product.badgeColor }}
                >
                  {product.badge}
                </div>
              )}
            </Link>
            <button className="absolute top-2 right-2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-md opacity-0 group-hover:opacity-100 z-10">
              <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
            </button>

            {/* Content */}
            <div className="flex-grow flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-[#9146FF] mb-1">{product.category}</div>
                <Link to={`/producto/${product.id}`}>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 hover:text-[#9146FF] transition-colors">{product.name}</h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews} reseñas)
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-green-600 font-medium">
                    {product.stock} en stock
                  </span>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </div>
                  {product.originalPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link to={`/producto/${product.id}`} className="flex-1 sm:flex-none px-6 py-3 bg-white border-2 border-[#9146FF] text-[#9146FF] rounded-lg font-semibold hover:bg-[#F5F0FF] transition-all text-center">
                    Ver detalles
                  </Link>
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
                    className="flex-1 sm:flex-none px-6 py-3 bg-[#9146FF] text-white rounded-lg font-semibold hover:bg-[#772CE8] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 hover:border-[#9146FF] hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col">
        {/* Image */}
        <Link to={`/producto/${product.id}`} className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden block">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.badge && (
            <div
              className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md"
              style={{ backgroundColor: product.badgeColor }}
            >
              {product.badge}
            </div>
          )}
        </Link>
        <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-md opacity-0 group-hover:opacity-100 z-10">
          <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
        </button>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="text-xs font-semibold text-[#9146FF] mb-1">{product.category}</div>
          <Link to={`/producto/${product.id}`}>
            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] hover:text-[#9146FF] transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({product.reviews})</span>
          </div>

          {/* Price */}
          <div className="mb-3">
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && (
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-green-600 font-medium">
              {product.stock} en stock
            </span>
          </div>

          {/* Action Button */}
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
            className="w-full mt-auto flex items-center justify-center gap-2 px-4 py-3 bg-[#9146FF] text-white rounded-lg font-semibold hover:bg-[#772CE8] transition-all shadow-md hover:shadow-lg hover:scale-105"
          >
            <ShoppingCart className="w-5 h-5" />
            Agregar al carrito
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full bg-white py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Catálogo de <span className="text-[#9146FF]">productos</span>
          </h1>
          <p className="text-gray-600">Descubre nuestra selección completa de tecnología</p>

          {/* Breadcrumb */}
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
          {/* Sidebar Filters - Desktop */}
          <div className={`
            fixed lg:sticky top-0 lg:top-4 left-0 h-screen lg:h-fit lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto w-80 lg:w-64
            bg-white border-2 border-gray-200 rounded-xl p-6
            lg:block lg:flex-shrink-0
            transition-transform duration-300 z-50
            ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            {/* Mobile Close Button */}
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

            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Categorías</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-all font-medium ${
                      selectedCategory === category.name
                        ? 'bg-[#9146FF] text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className="text-sm opacity-75">{category.count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Disponibilidad</h4>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-[#9146FF] border-gray-300 rounded focus:ring-[#9146FF]" defaultChecked />
                <span className="text-gray-700 font-medium">Solo en stock</span>
              </label>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Limpiar filtros
            </button>
          </div>

          {/* Mobile Overlay */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowFilters(false)}
            ></div>
          )}

          {/* Products Grid/List */}
          <div className="flex-grow">
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Mostrando <span className="font-semibold text-gray-900">{startIndex + 1}-{Math.min(endIndex, filteredProducts.length)}</span> de <span className="font-semibold text-gray-900">{filteredProducts.length}</span> productos
              </p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#9146FF] text-white rounded-lg font-semibold hover:bg-[#772CE8] transition-all"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filtros
              </button>
            </div>

            {/* Products */}
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
            }>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} isListView={viewMode === 'list'} />
              ))}
            </div>

            {/* Pagination */}
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
                    // Show first page, last page, current page, and pages around current
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