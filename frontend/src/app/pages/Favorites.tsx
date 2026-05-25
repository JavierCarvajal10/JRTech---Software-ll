import { Link } from 'react-router';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useFavorites, useRemoveFavorite } from '../hooks/useFavorites';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { friendlyErrorMessage } from '../api/client';

export function Favorites() {
  const { data: favorites = [], isLoading, isError, error, refetch } = useFavorites();
  const removeFavorite = useRemoveFavorite();
  const { addToCart } = useCart();
  const { showToast, showSuccess, showError } = useToast();

  const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')}`;

  const handleRemove = async (productId: number, productName: string) => {
    try {
      await removeFavorite.mutateAsync(productId);
      showSuccess('Eliminado de favoritos', productName);
    } catch (e) {
      showError('No se pudo eliminar', friendlyErrorMessage(e));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#9146FF]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
            <p className="text-gray-600 mb-6">{friendlyErrorMessage(error)}</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9146FF] text-white rounded-lg hover:bg-[#7d3ce0] transition-colors font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-[#F5F0FF] rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-[#9146FF] fill-[#9146FF]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Favoritos</h1>
            <p className="text-gray-600">
              {favorites.length === 0
                ? 'Aún no tienes productos guardados'
                : `${favorites.length} producto${favorites.length === 1 ? '' : 's'} guardado${favorites.length === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No tienes favoritos todavía
            </h2>
            <p className="text-gray-600 mb-6">
              Explora el catálogo y agrega productos a tu lista de favoritos
            </p>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#9146FF] text-white rounded-lg hover:bg-[#7d3ce0] transition-colors font-semibold"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((fav) => {
              const product = fav.product;
              return (
                <div
                  key={fav.id}
                  className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-[#9146FF] hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  <Link
                    to={`/producto/${product.id}`}
                    className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-hidden block"
                  >
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="text-xs font-semibold text-[#9146FF] mb-1 uppercase">
                      {product.category}
                    </div>
                    <Link
                      to={`/producto/${product.id}`}
                      className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-[#9146FF] transition-colors"
                    >
                      {product.name}
                    </Link>

                    <div className="mt-auto">
                      <div className="text-xl font-bold text-gray-900 mb-3">
                        {formatPrice(product.price)}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                            });
                            showToast(product.name);
                          }}
                          disabled={product.stock === 0}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#9146FF] text-white rounded-lg font-semibold hover:bg-[#7d3ce0] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {product.stock === 0 ? 'Agotado' : 'Carrito'}
                        </button>
                        <button
                          onClick={() => handleRemove(product.id, product.name)}
                          disabled={removeFavorite.isPending}
                          className="p-2 border-2 border-gray-300 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50"
                          title="Eliminar de favoritos"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
