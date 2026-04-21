import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  ChevronRight,
  ChevronLeft,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Package,
  CreditCard,
  Shield,
  Eye,
  RotateCcw
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getProductById } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Parse and validate ID
  const productId = id ? parseInt(id, 10) : NaN;
  const product = !isNaN(productId) ? getProductById(productId) : undefined;

  // State
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h2>
          <p className="text-gray-600 mb-4">El producto con ID "{id}" no existe en nuestro catálogo.</p>
          <Link to="/catalogo" className="text-[#9146FF] hover:text-[#772CE8] font-semibold">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  // Ensure product has at least one image
  const productImages = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];

  // Get current display images - simplified logic
  const getDisplayImages = (): string[] => {
    // If no colors, use product images
    if (!product.colors || product.colors.length === 0) {
      return productImages;
    }

    // Validate selected color index
    const validColorIndex = selectedColor >= 0 && selectedColor < product.colors.length
      ? selectedColor
      : 0;

    // Get color image
    const colorObj = product.colors[validColorIndex];
    if (colorObj && colorObj.image) {
      // Return color image first, then product images
      return [colorObj.image, ...productImages];
    }

    // Fallback to product images
    return productImages;
  };

  const displayImages = getDisplayImages();

  // Ensure selectedImage is valid
  const validImageIndex = selectedImage >= 0 && selectedImage < displayImages.length
    ? selectedImage
    : 0;

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CO')}`;
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleColorChange = (colorIndex: number) => {
    setSelectedColor(colorIndex);
    setSelectedImage(0); // Reset to first image when color changes
  };

  const handlePreviousImage = () => {
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link to="/" className="text-gray-600 hover:text-[#9146FF] transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link to="/catalogo" className="text-gray-600 hover:text-[#9146FF] transition-colors">
            Catálogo
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border-2 border-gray-200 group">
              <ImageWithFallback
                src={displayImages[validImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div
                  className="absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg"
                  style={{ backgroundColor: product.badgeColor }}
                >
                  {product.badge}
                </div>
              )}

              {/* Navigation Arrows - Only show if more than 1 image */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-900" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-900" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images - Only show if more than 1 image */}
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {displayImages.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border-2 transition-all ${
                      validImageIndex === index
                        ? 'border-[#9146FF] ring-2 ring-[#9146FF]/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Title and Stock */}
            <div>
              <div className="text-sm font-semibold text-[#9146FF] mb-2">
                {product.category}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">SKU: {product.sku}</span>
                {product.stock > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-green-600 font-semibold">
                      Hay existencias
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating} ({product.reviews} reseñas)
              </span>
            </div>

            {/* Price */}
            <div className="py-6 border-y-2 border-gray-200">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {formatPrice(product.price)}
              </div>
              {product.originalPrice && (
                <div className="flex items-center gap-3">
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Color Selector - Only show if product has colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Color: <span className="text-[#9146FF]">
                    {product.colors[selectedColor >= 0 && selectedColor < product.colors.length ? selectedColor : 0]?.name || 'Selecciona un color'}
                  </span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorChange(index)}
                      className={`relative w-14 h-14 rounded-full border-3 transition-all ${
                        selectedColor === index
                          ? 'border-[#9146FF] ring-4 ring-[#9146FF]/30 scale-110'
                          : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                      }`}
                      title={color.name}
                    >
                      <div
                        className="w-full h-full rounded-full shadow-inner"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      {selectedColor === index && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 bg-white rounded-full border-2 border-[#9146FF] shadow-md"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Cantidad
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="px-6 py-3 font-bold text-gray-900 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {product.stock} unidades disponibles
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: displayImages[0],
                      selectedColor: product.colors && product.colors[selectedColor] ? product.colors[selectedColor].name : undefined
                    });
                  }
                  showToast(product.name);
                }}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[#9146FF] text-white rounded-xl font-bold hover:bg-[#772CE8] transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5" />
                Añadir al Carrito
              </button>
              <button
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: displayImages[0],
                      selectedColor: product.colors && product.colors[selectedColor] ? product.colors[selectedColor].name : undefined
                    });
                  }
                  showToast(product.name);
                  setTimeout(() => navigate('/carrito'), 500);
                }}
                className="flex-1 px-6 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Comprar Ahora
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all">
                <Heart className="w-5 h-5" />
                Lista de deseos
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* People Viewing */}
            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <Eye className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-orange-800">
                <span className="font-bold">7</span> personas viendo este producto ahora
              </span>
            </div>

            {/* Shipping Info */}
            <div className="space-y-3 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-[#9146FF] flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Recoge en la Tienda</div>
                  <div className="text-sm text-gray-600">
                    Gratis - Se calcula al finalizar compra
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-[#9146FF] flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Envío a Nivel Nacional</div>
                  <div className="text-sm text-gray-600">
                    Recibe en la puerta de tu casa - 2-3 Días
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-[#9146FF] flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Garantía a Nivel Nacional</div>
                  <div className="text-sm text-gray-600">
                    Paga en efectivo al recibir el producto - 12 meses
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#9146FF] flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Devoluciones Gratis</div>
                  <div className="text-sm text-gray-600">Más detalles</div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Métodos de pago:</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700">
                  PSE
                </div>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700">
                  NEQUI
                </div>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700">
                  VISA
                </div>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700">
                  MASTERCARD
                </div>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700">
                  AMEX
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description and Specifications Tabs */}
        <div className="mt-16">
          <div className="border-b-2 border-gray-200 mb-8">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-4 px-2 font-bold transition-all ${
                  activeTab === 'description'
                    ? 'text-[#9146FF] border-b-4 border-[#9146FF]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Descripción
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={`pb-4 px-2 font-bold transition-all ${
                  activeTab === 'specifications'
                    ? 'text-[#9146FF] border-b-4 border-[#9146FF]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Especificaciones
              </button>
            </div>
          </div>

          {activeTab === 'description' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Descripción del Producto
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {product.description}
                </p>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Características Principales
                </h4>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#9146FF] mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200 flex items-center justify-center">
                <ImageWithFallback
                  src={displayImages[1] || displayImages[0]}
                  alt={product.name}
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-[#9146FF] px-6 py-4">
                <h3 className="text-xl font-bold text-white">
                  Especificaciones Técnicas
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {product.specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold text-gray-900">{spec.label}</div>
                    <div className="sm:col-span-2 text-gray-700">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
