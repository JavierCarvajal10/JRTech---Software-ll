import { useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  ChevronRight,
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

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviews: number;
  stock: number;
  badge?: string;
  badgeColor?: string;
  sku: string;
  description: string;
  specifications: { label: string; value: string }[];
  features: string[];
}

export function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');

  const products: Product[] = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max 256GB Titanio Natural',
      category: 'Apple',
      price: 5499000,
      originalPrice: 6200000,
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
        'https://images.unsplash.com/photo-1695048117832-9e13d1bb44e2?w=800',
        'https://images.unsplash.com/photo-1695048117142-1a20484d2569?w=800',
        'https://images.unsplash.com/photo-1695048133086-4b45e6c9f0a8?w=800'
      ],
      rating: 4.9,
      reviews: 234,
      stock: 12,
      badge: 'Más vendido',
      badgeColor: '#9146FF',
      sku: '100026971',
      description: 'El iPhone 15 Pro Max cuenta con un diseño de titanio aeroespacial resistente y ligero, con la parte posterior de vidrio mate texturizado. Tiene un botón de Acción personalizable y un puerto USB‑C universal. Resistente a salpicaduras, agua y polvo.',
      specifications: [
        { label: 'Procesador', value: 'Apple A17 Pro' },
        { label: 'Almacenamiento', value: '256 GB' },
        { label: 'RAM', value: '8 GB' },
        { label: 'Pantalla', value: '6.7" Super Retina XDR' },
        { label: 'Cámara principal', value: '48MP + 12MP + 12MP' },
        { label: 'Batería', value: 'Hasta 29 horas de reproducción de video' },
        { label: 'Sistema operativo', value: 'iOS 17' },
        { label: 'Conectividad', value: '5G, WiFi 6E, Bluetooth 5.3' },
        { label: 'Dimensiones', value: '159.9 x 76.7 x 8.25 mm' },
        { label: 'Peso', value: '221 g' }
      ],
      features: [
        'Chip A17 Pro de última generación',
        'Sistema de cámaras Pro con teleobjetivo de 5x',
        'Pantalla Super Retina XDR siempre activa',
        'Isla Dinámica con notificaciones en vivo',
        'Diseño de titanio resistente y ligero'
      ]
    },
    {
      id: 2,
      name: 'MacBook Pro 14" M3 Pro 18GB RAM 512GB SSD',
      category: 'Apple',
      price: 8999000,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800'
      ],
      rating: 5.0,
      reviews: 189,
      stock: 5,
      badge: 'Nuevo',
      badgeColor: '#10B981',
      sku: '200039821',
      description: 'MacBook Pro con el revolucionario chip M3 Pro supera los límites del rendimiento y las capacidades. Con una pantalla Liquid Retina XDR impresionante, todo lo que necesitas en un portátil profesional.',
      specifications: [
        { label: 'Procesador', value: 'Apple M3 Pro (11 núcleos)' },
        { label: 'GPU', value: '14 núcleos' },
        { label: 'RAM', value: '18 GB unificada' },
        { label: 'Almacenamiento', value: '512 GB SSD' },
        { label: 'Pantalla', value: '14.2" Liquid Retina XDR' },
        { label: 'Resolución', value: '3024 x 1964 píxeles' },
        { label: 'Batería', value: 'Hasta 18 horas' },
        { label: 'Puertos', value: '3x Thunderbolt 4, HDMI, SD, MagSafe 3' },
        { label: 'Peso', value: '1.55 kg' }
      ],
      features: [
        'Chip M3 Pro para rendimiento extremo',
        'Pantalla Liquid Retina XDR con ProMotion',
        'Hasta 18 horas de batería',
        'Sistema de sonido de seis altavoces',
        'Cámara FaceTime HD 1080p'
      ]
    },
    {
      id: 3,
      name: 'NVIDIA RTX 4090 24GB GDDR6X Gaming',
      category: 'Componentes PC',
      price: 9200000,
      originalPrice: 10500000,
      images: [
        'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800'
      ],
      rating: 4.8,
      reviews: 156,
      stock: 3,
      badge: 'Oferta',
      badgeColor: '#EF4444',
      sku: '300012456',
      description: 'La GeForce RTX 4090 es la GPU definitiva para gaming y creación de contenido. Impulsada por la arquitectura NVIDIA Ada Lovelace, ofrece un rendimiento sin precedentes con Ray Tracing de última generación.',
      specifications: [
        { label: 'GPU', value: 'NVIDIA GeForce RTX 4090' },
        { label: 'Memoria', value: '24 GB GDDR6X' },
        { label: 'Núcleos CUDA', value: '16384' },
        { label: 'Frecuencia Base', value: '2.23 GHz' },
        { label: 'Frecuencia Boost', value: '2.52 GHz' },
        { label: 'Bus de memoria', value: '384-bit' },
        { label: 'TDP', value: '450W' },
        { label: 'Conectores', value: '3x DisplayPort 1.4a, 1x HDMI 2.1' }
      ],
      features: [
        'Arquitectura Ada Lovelace de última generación',
        'Ray Tracing y DLSS 3 con IA',
        '24GB de memoria GDDR6X ultrarrápida',
        'Soporte para resoluciones hasta 8K',
        'Sistema de refrigeración avanzado'
      ]
    },
    {
      id: 4,
      name: 'Sony WH-1000XM5 Audífonos Noise Cancelling',
      category: 'Audio & Streaming',
      price: 1450000,
      images: [
        'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800'
      ],
      rating: 4.7,
      reviews: 445,
      stock: 25,
      sku: '400078923',
      description: 'Los audífonos premium con cancelación de ruido más avanzados. Disfruta de un sonido excepcional con la mejor tecnología de cancelación de ruido del mercado y hasta 30 horas de batería.',
      specifications: [
        { label: 'Tipo', value: 'Over-ear inalámbricos' },
        { label: 'Cancelación de ruido', value: 'Activa con 8 micrófonos' },
        { label: 'Batería', value: 'Hasta 30 horas' },
        { label: 'Carga rápida', value: '3 min = 3 horas' },
        { label: 'Bluetooth', value: '5.2' },
        { label: 'Códecs', value: 'LDAC, AAC, SBC' },
        { label: 'Peso', value: '250 g' }
      ],
      features: [
        'Cancelación de ruido líder en la industria',
        'Audio de alta resolución con LDAC',
        'Batería de hasta 30 horas',
        'Ajuste automático del sonido ambiente',
        'Multipoint para conectar dos dispositivos'
      ]
    },
    {
      id: 5,
      name: 'Samsung Odyssey G9 49" 240Hz Curved Gaming',
      category: 'Computadores',
      price: 4200000,
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'
      ],
      rating: 4.9,
      reviews: 89,
      stock: 7,
      sku: '500045612',
      description: 'Monitor gaming curvo ultra ancho de 49 pulgadas con resolución Dual QHD, 240Hz y tecnología Quantum Mini-LED para una experiencia de juego inmersiva sin igual.',
      specifications: [
        { label: 'Tamaño', value: '49" curvo 1000R' },
        { label: 'Resolución', value: '5120 x 1440 (Dual QHD)' },
        { label: 'Tasa de refresco', value: '240Hz' },
        { label: 'Tiempo de respuesta', value: '1ms (GTG)' },
        { label: 'Panel', value: 'VA Quantum Mini-LED' },
        { label: 'HDR', value: 'HDR 2000' },
        { label: 'FreeSync / G-Sync', value: 'Compatible' }
      ],
      features: [
        'Pantalla curva 1000R ultra inmersiva',
        '240Hz para gaming competitivo',
        'Quantum Mini-LED con HDR 2000',
        'Relación de aspecto 32:9',
        'AMD FreeSync Premium Pro'
      ]
    }
  ];

  const product = products.find((p) => p.id === parseInt(id || '0'));

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h2>
          <Link to="/catalogo" className="text-[#9146FF] hover:text-[#772CE8] font-semibold">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CO')}`;
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
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
            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border-2 border-gray-200">
              <ImageWithFallback
                src={product.images[selectedImage]}
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
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index
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
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-green-600 font-semibold">
                    Hay existencias
                  </span>
                </div>
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
              <button className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[#9146FF] text-white rounded-xl font-bold hover:bg-[#772CE8] transition-all shadow-lg hover:shadow-xl hover:scale-105">
                <ShoppingCart className="w-5 h-5" />
                Añadir al Carrito
              </button>
              <button className="flex-1 px-6 py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg hover:shadow-xl hover:scale-105">
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
                <span className="font-bold">7</span> personas viendo este producto ahora!
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
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200">
                <ImageWithFallback
                  src={product.images[1] || product.images[0]}
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
