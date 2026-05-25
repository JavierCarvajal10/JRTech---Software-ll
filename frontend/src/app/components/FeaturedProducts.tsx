import { ShoppingCart, ChevronRight, Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Link } from 'react-router';
import { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useProducts } from '../hooks/useProducts';

export function FeaturedProducts() {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const { data: products = [], isLoading, isError, error } = useProducts();

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        products
          .map((p) => p.categoryParent ?? p.category)
          .filter((c): c is string => !!c && c !== 'Sin categoría')
      )
    );
    return ['Todos', ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const base =
      selectedCategory === 'Todos'
        ? products
        : products.filter(
            (p) =>
              p.categoryParent === selectedCategory ||
              p.category === selectedCategory
          );
    // Productos con imagen real primero (sort estable por índice original).
    return base
      .map((p, i) => ({ p, i }))
      .sort((a, b) => {
        if (a.p.hasImage !== b.p.hasImage) return a.p.hasImage ? -1 : 1;
        return a.i - b.i;
      })
      .map(({ p }) => p)
      .slice(0, 8);
  }, [products, selectedCategory]);

  const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')}`;

  return (
    <section className="w-full bg-white py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Productos <span className="text-[#9146FF]">destacados</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Una selección especial de lo mejor que tenemos para ti</p>
          </div>
          <Link
            to="/catalogo"
            className="hidden md:flex items-center gap-2 text-[#9146FF] hover:text-[#772CE8] font-medium transition-colors group"
          >
            Ver catálogo completo
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-10 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 ${
                  selectedCategory === category
                    ? 'bg-[#9146FF] text-white shadow-lg hover:bg-[#772CE8]'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#9146FF] hover:text-[#9146FF] hover:shadow-md'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin text-[#9146FF]" />
            <span>Cargando productos…</span>
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-red-600">
            Error al cargar productos: {error instanceof Error ? error.message : 'desconocido'}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            Aún no hay productos disponibles. Agrega productos desde el panel de admin.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-[#9146FF] hover:shadow-xl transition-all duration-300 group flex flex-col"
              >
                <Link to={`/producto/${product.id}`} className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-hidden block">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="p-3 sm:p-5 flex flex-col flex-grow">
                  <div className="text-[10px] sm:text-xs font-semibold text-[#9146FF] mb-1 uppercase truncate">
                    {product.category}
                  </div>

                  <Link to={`/producto/${product.id}`}>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2 sm:mb-3 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] hover:text-[#9146FF] transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mb-2 sm:mb-3">
                    <div className="text-lg sm:text-2xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-xs sm:text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                    className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 bg-[#9146FF] text-white rounded-xl font-semibold text-xs sm:text-base hover:bg-[#772CE8] active:scale-95 transition-all shadow-md hover:shadow-lg mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="truncate">Agregar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-5 sm:p-8 border-2 border-purple-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                ¿No encuentras lo que buscas?
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Tenemos {products.length} productos disponibles — o lo importamos para ti.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/catalogo"
                className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 font-semibold px-6 py-3 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap text-center"
              >
                Ver catálogo completo
              </Link>
              <Link
                to="/importaciones"
                className="bg-[#9146FF] hover:bg-[#772CE8] text-white font-semibold px-6 py-3 rounded-full transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap text-center"
              >
                Solicitar importación
              </Link>
            </div>
          </div>
        </div>

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
