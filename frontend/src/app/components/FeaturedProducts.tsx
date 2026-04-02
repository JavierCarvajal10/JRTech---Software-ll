import { ShoppingCart, CreditCard, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Link } from 'react-router';

interface Product {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: 'destacado' | 'nuevo' | 'oferta' | 'importado';
  stock: number;
  badgeColor: string;
}

export function FeaturedProducts() {
  const products: Product[] = [
    {
      id: 1,
      name: 'iPhone 15 Pro 256GB Titanio',
      category: 'APPLE',
      subcategory: 'IPHONE',
      price: 4299000,
      originalPrice: 4800000,
      image: 'https://images.unsplash.com/photo-1695619575414-1ce52a163291?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcGhvbmUlMjAxNSUyMHBybyUyMHRpdGFuaXVtfGVufDF8fHx8MTc3MzU5MjQzMnww&ixlib=rb-4.1.0&q=80&w=1080',
      badge: 'destacado',
      stock: 5,
      badgeColor: '#9146FF'
    },
    {
      id: 2,
      name: 'MacBook Air M3 13" 16GB',
      category: 'APPLE',
      subcategory: 'MAC',
      price: 5899000,
      image: 'https://images.unsplash.com/photo-1667940903819-9319fe82949f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWNib29rJTIwYWlyJTIwbGFwdG9wfGVufDF8fHx8MTc3MzY5NjQyOXww&ixlib=rb-4.1.0&q=80&w=1080',
      badge: 'nuevo',
      stock: 3,
      badgeColor: '#10B981'
    },
    {
      id: 3,
      name: 'RTX 4070 Ti Super 16GB',
      category: 'GPU GRÁFICAS',
      subcategory: '',
      price: 4100000,
      originalPrice: 4600000,
      image: 'https://images.unsplash.com/photo-1555618565-9f2b0323a10d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudmlkaWElMjBydHglMjBncmFwaGljcyUyMGNhcmR8ZW58MXx8fHwxNzczNjQ0NDM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      badge: 'oferta',
      stock: 2,
      badgeColor: '#EF4444'
    },
    {
      id: 4,
      name: 'Sony WH-1000XM5 Negro',
      category: 'AUDÍFONOS',
      subcategory: '',
      price: 1290000,
      image: 'https://images.unsplash.com/photo-1624978960894-bed9218acd39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb255JTIwaGVhZHBob25lcyUyMGJsYWNrfGVufDF8fHx8MTc3MzYzMTQ4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      badge: 'importado',
      stock: 1,
      badgeColor: '#F59E0B'
    },
    {
      id: 5,
      name: 'Apple Watch Series 9 45mm',
      category: 'APPLE',
      subcategory: 'WATCH',
      price: 1890000,
      originalPrice: 2100000,
      image: 'https://images.unsplash.com/photo-1705307543536-06ebcb39bb0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcHBsZSUyMHdhdGNoJTIwc2VyaWVzJTIwOXxlbnwxfHx8fDE3NzM1OTI0MzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      stock: 5,
      badgeColor: '#9146FF'
    },
    {
      id: 6,
      name: 'ASUS ROG Strix G16 i7 RTX 4060',
      category: 'BOARDS',
      subcategory: '',
      price: 1450000,
      image: 'https://images.unsplash.com/photo-1642099716324-4cd41f0c9f4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc3VzJTIwcm9nJTIwZ2FtaW5nJTIwbGFwdG9wfGVufDF8fHx8MTc3MzY5NjQzMXww&ixlib=rb-4.1.0&q=80&w=1080',
      badge: 'importado',
      stock: 1,
      badgeColor: '#F59E0B'
    },
    {
      id: 7,
      name: 'Samsung 990 Pro NVMe 2TB',
      category: 'ALMACENAMIENTO',
      subcategory: '',
      price: 520000,
      originalPrice: 650000,
      image: 'https://images.unsplash.com/photo-1610415394675-22121ca0de23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW1zdW5nJTIwc3NkJTIwc3RvcmFnZXxlbnwxfHx8fDE3NzM2OTY0MzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      badge: 'oferta',
      stock: 4,
      badgeColor: '#EF4444'
    },
    {
      id: 8,
      name: 'Blue Yeti USB Negro',
      category: 'MICRÓFONOS',
      subcategory: '',
      price: 680000,
      image: 'https://images.unsplash.com/photo-1623643752842-d60dd96fff58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIweWV0aSUyMG1pY3JvcGhvbmV8ZW58MXx8fHwxNzczNjk2NDMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      stock: 3,
      badgeColor: '#9146FF'
    }
  ];

  const categories = [
    { name: 'Todos', active: true },
    { name: 'Apple', icon: '🍎' },
    { name: 'Laptops', icon: '💻' },
    { name: 'GPU', icon: '🎮' },
    { name: 'Audio', icon: '🎧' },
    { name: 'Accesorios', icon: '⚡' }
  ];

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CO')}`;
  };

  const getBadgeLabel = (badge: string) => {
    const labels = {
      destacado: 'Destacado',
      nuevo: 'Nuevo',
      oferta: 'Oferta',
      importado: 'Importado'
    };
    return labels[badge as keyof typeof labels] || badge;
  };

  return (
    <section className="w-full bg-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Productos <span className="text-[#9146FF]">destacados</span>
            </h2>
            <p className="text-gray-600 mt-2">Una selección especial de lo mejor que tenemos para ti</p>
          </div>
          <Link
            to="/catalogo"
            className="hidden md:flex items-center gap-2 text-[#9146FF] hover:text-[#772CE8] font-medium transition-colors group"
          >
            Ver catálogo completo
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                category.active
                  ? 'bg-[#9146FF] text-white shadow-md hover:bg-[#772CE8]'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#9146FF] hover:text-[#9146FF]'
              }`}
            >
              {category.icon && <span className="mr-2">{category.icon}</span>}
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <div 
              key={product.id}
              className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-[#9146FF] hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-hidden">
                {/* Product Image */}
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-grow">
                {/* Category */}
                <div className="text-xs font-semibold text-gray-500 mb-1">
                  {product.category} {product.subcategory && `· ${product.subcategory}`}
                </div>

                {/* Product Name */}
                <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3rem]">
                  {product.name}
                </h3>

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
                    En stock · {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-[#9146FF] text-[#9146FF] rounded-xl font-semibold hover:bg-[#F5F0FF] transition-all group/btn">
                    <ShoppingCart className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-sm">Carrito</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-[#9146FF] text-white rounded-xl font-semibold hover:bg-[#772CE8] transition-all shadow-md hover:shadow-lg hover:scale-105">
                    <CreditCard className="w-5 h-5" />
                    <span className="text-sm">Comprar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ¿No encuentras lo que buscas?
              </h3>
              <p className="text-gray-600">
                Tenemos más de 67 productos disponibles — o lo importamos para ti.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/catalogo" className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 font-semibold px-6 py-3 rounded-full transition-all shadow-sm hover:shadow-md whitespace-nowrap">
                Ver catálogo completo
              </Link>
              <button className="bg-[#9146FF] hover:bg-[#772CE8] text-white font-semibold px-6 py-3 rounded-full transition-all shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap">
                Solicitar importación
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Link */}
        <div className="md:hidden mt-6 flex justify-center">
          <Link
            to="/catalogo"
            className="flex items-center gap-2 text-[#9146FF] hover:text-[#772CE8] font-medium transition-colors group"
          >
            Ver catálogo completo
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}