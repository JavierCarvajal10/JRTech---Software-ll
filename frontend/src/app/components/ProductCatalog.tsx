import { useState } from 'react';
import { Link } from 'react-router';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState('Recomendados');

  const products: Product[] = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max 256GB Titanio Natural',
      category: 'Apple',
      price: 5499000,
      originalPrice: 6200000,
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
      rating: 4.9,
      reviews: 234,
      stock: 12,
      badge: 'Más vendido',
      badgeColor: '#9146FF'
    },
    {
      id: 2,
      name: 'MacBook Pro 14" M3 Pro 18GB RAM 512GB SSD',
      category: 'Apple',
      price: 8999000,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      rating: 5.0,
      reviews: 189,
      stock: 5,
      badge: 'Nuevo',
      badgeColor: '#10B981'
    },
    {
      id: 3,
      name: 'NVIDIA RTX 4090 24GB GDDR6X Gaming',
      category: 'Componentes PC',
      price: 9200000,
      originalPrice: 10500000,
      image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500',
      rating: 4.8,
      reviews: 156,
      stock: 3,
      badge: 'Oferta',
      badgeColor: '#EF4444'
    },
    {
      id: 4,
      name: 'Sony WH-1000XM5 Audífonos Noise Cancelling',
      category: 'Audio & Streaming',
      price: 1450000,
      image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500',
      rating: 4.7,
      reviews: 445,
      stock: 25,
    },
    {
      id: 5,
      name: 'Samsung Odyssey G9 49" 240Hz Curved Gaming',
      category: 'Computadores',
      price: 4200000,
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500',
      rating: 4.9,
      reviews: 89,
      stock: 7,
    },
    {
      id: 6,
      name: 'Logitech MX Master 3S Mouse Inalámbrico',
      category: 'Accesorios',
      price: 420000,
      originalPrice: 520000,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
      rating: 4.6,
      reviews: 678,
      stock: 45,
      badge: 'Oferta',
      badgeColor: '#EF4444'
    },
    {
      id: 7,
      name: 'AMD Ryzen 9 7950X3D Procesador 16 Núcleos',
      category: 'Componentes PC',
      price: 2890000,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500',
      rating: 4.8,
      reviews: 234,
      stock: 15,
    },
    {
      id: 8,
      name: 'Corsair Vengeance RGB 32GB DDR5 6000MHz',
      category: 'Componentes PC',
      price: 650000,
      image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500',
      rating: 4.7,
      reviews: 312,
      stock: 28,
    },
    {
      id: 9,
      name: 'Elgato Stream Deck MK.2 15 Teclas LCD',
      category: 'Audio & Streaming',
      price: 890000,
      image: 'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=500',
      rating: 4.9,
      reviews: 167,
      stock: 12,
      badge: 'Más vendido',
      badgeColor: '#9146FF'
    },
    {
      id: 10,
      name: 'Apple AirPods Pro 2da Gen USB-C',
      category: 'Apple',
      price: 1150000,
      image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500',
      rating: 4.8,
      reviews: 892,
      stock: 34,
    },
    {
      id: 11,
      name: 'ASUS ROG Strix Helios GX601 Case Gaming RGB',
      category: 'Componentes PC',
      price: 1280000,
      image: 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=500',
      rating: 4.6,
      reviews: 124,
      stock: 8,
    },
    {
      id: 12,
      name: 'Razer BlackWidow V4 Pro Teclado Mecánico',
      category: 'Accesorios',
      price: 980000,
      originalPrice: 1200000,
      image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500',
      rating: 4.7,
      reviews: 456,
      stock: 19,
    }
  ];

  const categories = [
    { name: 'Todos', count: products.length },
    { name: 'Apple', count: 3 },
    { name: 'Componentes PC', count: 5 },
    { name: 'Audio & Streaming', count: 2 },
    { name: 'Computadores', count: 1 },
    { name: 'Accesorios', count: 2 }
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
                  <button className="flex-1 sm:flex-none px-6 py-3 bg-[#9146FF] text-white rounded-lg font-semibold hover:bg-[#772CE8] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
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
          <button className="w-full mt-auto flex items-center justify-center gap-2 px-4 py-3 bg-[#9146FF] text-white rounded-lg font-semibold hover:bg-[#772CE8] transition-all shadow-md hover:shadow-lg hover:scale-105">
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
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-grow relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos, marcas, categorías..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] transition-all"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-3">
              <div className="relative flex-grow lg:flex-grow-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full lg:w-auto appearance-none pl-4 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] transition-all font-medium cursor-pointer"
                >
                  <option>Recomendados</option>
                  <option>Precio: Menor a Mayor</option>
                  <option>Precio: Mayor a Menor</option>
                  <option>Más vendidos</option>
                  <option>Mejor valorados</option>
                  <option>Nuevos</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex bg-gray-50 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'grid'
                      ? 'bg-[#9146FF] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-[#9146FF] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 bg-[#9146FF] text-white rounded-lg font-semibold hover:bg-[#772CE8] transition-all"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filtros
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <div className={`
            fixed lg:sticky top-0 left-0 h-screen lg:h-auto w-80 lg:w-64
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

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Rango de precio</h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000000])}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] text-sm"
                  />
                </div>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all text-sm">
                  Aplicar
                </button>
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
            <button className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all">
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
                Mostrando <span className="font-semibold text-gray-900">{products.length}</span> productos
              </p>
              <button className="hidden lg:flex items-center gap-2 text-[#9146FF] hover:text-[#772CE8] font-medium transition-colors">
                <SlidersHorizontal className="w-4 h-4" />
                Más filtros
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
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  Anterior
                </button>
                <button className="px-4 py-2 bg-[#9146FF] text-white rounded-lg font-medium">1</button>
                <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all">2</button>
                <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all">3</button>
                <span className="px-2 text-gray-500">...</span>
                <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all">10</button>
                <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all">
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
