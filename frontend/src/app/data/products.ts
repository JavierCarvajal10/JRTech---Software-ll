export interface ProductColor {
  name: string;
  hex: string;
  image: string;
}

export interface Product {
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
  colors?: ProductColor[];
}

export const products: Product[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    category: 'Apple',
    price: 5499000,
    originalPrice: 6200000,
    images: [
      'https://images.unsplash.com/photo-1695619575474-9b45e37bc1e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcGhvbmUlMjAxNSUyMHBybyUyMHRpdGFuaXVtfGVufDF8fHx8MTc3NjczNTE4NHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1695619575333-fc73accd441e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxpcGhvbmUlMjAxNSUyMHBybyUyMHRpdGFuaXVtfGVufDF8fHx8MTc3NjczNTE4NHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1695619575414-1ce52a163291?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxpcGhvbmUlMjAxNSUyMHBybyUyMHRpdGFuaXVtfGVufDF8fHx8MTc3NjczNTE4NHww&ixlib=rb-4.1.0&q=80&w=1080'
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
    ],
    colors: [
      {
        name: 'Titanio Natural',
        hex: '#D4C5B0',
        image: 'https://images.unsplash.com/photo-1695619575474-9b45e37bc1e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcGhvbmUlMjAxNSUyMHBybyUyMHRpdGFuaXVtfGVufDF8fHx8MTc3NjczNTE4NHww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        name: 'Titanio Azul',
        hex: '#506A8C',
        image: 'https://images.unsplash.com/photo-1695619575474-9b45e37bc1e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcGhvbmUlMjAxNSUyMHBybyUyMHRpdGFuaXVtfGVufDF8fHx8MTc3NjczNTE4NHww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        name: 'Titanio Blanco',
        hex: '#E8E8E8',
        image: 'https://images.unsplash.com/photo-1695619575474-9b45e37bc1e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcGhvbmUlMjAxNSUyMHBybyUyMHRpdGFuaXVtfGVufDF8fHx8MTc3NjczNTE4NHww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        name: 'Titanio Negro',
        hex: '#3B3B3B',
        image: 'https://images.unsplash.com/photo-1695619575474-9b45e37bc1e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcGhvbmUlMjAxNSUyMHBybyUyMHRpdGFuaXVtfGVufDF8fHx8MTc3NjczNTE4NHww&ixlib=rb-4.1.0&q=80&w=1080'
      }
    ]
  },
  {
    id: 2,
    name: 'MacBook Pro 14" M3 Pro 18GB RAM 512GB SSD',
    category: 'Apple',
    price: 8999000,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'
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
      'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80'
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
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
      'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&q=80'
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
    ],
    colors: [
      {
        name: 'Negro',
        hex: '#1F2937',
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80'
      },
      {
        name: 'Rosa',
        hex: '#FFC0CB',
        image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&q=80'
      }
    ]
  },
  {
    id: 5,
    name: 'Samsung Odyssey G9 49" 240Hz Curved Gaming',
    category: 'Computadores',
    price: 4200000,
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
      'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80',
      'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&q=80'
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
  },
  {
    id: 6,
    name: 'Logitech MX Master 3S Mouse Inalámbrico',
    category: 'Accesorios',
    price: 420000,
    originalPrice: 520000,
    images: [
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
      'https://images.unsplash.com/photo-1586920740099-c8eeaa14e29f?w=800&q=80'
    ],
    rating: 4.6,
    reviews: 678,
    stock: 45,
    badge: 'Oferta',
    badgeColor: '#EF4444',
    sku: '600012345',
    description: 'Mouse inalámbrico premium con sensor de 8K DPI, desplazamiento electromagnético silencioso y hasta 70 días de batería. Diseñado para productividad máxima.',
    specifications: [
      { label: 'Sensor', value: '8K DPI' },
      { label: 'Conectividad', value: 'Bluetooth + USB-C' },
      { label: 'Batería', value: 'Hasta 70 días' },
      { label: 'Botones', value: '7 programables' },
      { label: 'Peso', value: '141 g' }
    ],
    features: [
      'Sensor de 8K DPI de alta precisión',
      'Desplazamiento electromagnético MagSpeed',
      'Hasta 70 días con una sola carga',
      'Compatible con múltiples dispositivos',
      'Diseño ergonómico premium'
    ],
    colors: [
      {
        name: 'Grafito',
        hex: '#374151',
        image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80'
      },
      {
        name: 'Blanco',
        hex: '#F3F4F6',
        image: 'https://images.unsplash.com/photo-1586920740099-c8eeaa14e29f?w=800&q=80'
      }
    ]
  },
  {
    id: 7,
    name: 'AMD Ryzen 9 7950X3D Procesador 16 Núcleos',
    category: 'Componentes PC',
    price: 2890000,
    images: [
      'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
      'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=800&q=80',
      'https://images.unsplash.com/photo-1591799265444-d66432b91588?w=800&q=80'
    ],
    rating: 4.8,
    reviews: 234,
    stock: 15,
    sku: '700012789',
    description: 'El procesador más potente de AMD con tecnología 3D V-Cache para gaming extremo. 16 núcleos y 32 hilos de procesamiento con frecuencias de hasta 5.7 GHz.',
    specifications: [
      { label: 'Núcleos', value: '16 núcleos / 32 hilos' },
      { label: 'Frecuencia base', value: '4.2 GHz' },
      { label: 'Frecuencia boost', value: 'Hasta 5.7 GHz' },
      { label: 'Caché L3', value: '128 MB (3D V-Cache)' },
      { label: 'TDP', value: '120W' },
      { label: 'Socket', value: 'AM5' },
      { label: 'Memoria', value: 'DDR5 hasta 5200 MHz' }
    ],
    features: [
      'Tecnología 3D V-Cache para máximo rendimiento gaming',
      '16 núcleos Zen 4 de alto rendimiento',
      'Frecuencias de hasta 5.7 GHz',
      'Compatible con DDR5 y PCIe 5.0',
      'Ideal para gaming y creación de contenido'
    ]
  },
  {
    id: 8,
    name: 'Corsair Vengeance RGB 32GB DDR5 6000MHz',
    category: 'Componentes PC',
    price: 650000,
    images: [
      'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80'
    ],
    rating: 4.7,
    reviews: 312,
    stock: 28,
    sku: '800023456',
    description: 'Memoria DDR5 de alto rendimiento con iluminación RGB dinámica. Optimizada para plataformas Intel y AMD de última generación con velocidades de 6000MHz.',
    specifications: [
      { label: 'Capacidad', value: '32 GB (2x16GB)' },
      { label: 'Tipo', value: 'DDR5' },
      { label: 'Velocidad', value: '6000 MHz' },
      { label: 'Latencia', value: 'CL36' },
      { label: 'Voltaje', value: '1.35V' },
      { label: 'RGB', value: 'Corsair iCUE compatible' }
    ],
    features: [
      'Velocidad DDR5 de 6000MHz',
      'Iluminación RGB personalizable',
      'Disipador de calor de aluminio',
      'Compatible con Intel XMP 3.0',
      'Diseño optimizado para overclocking'
    ]
  },
  {
    id: 9,
    name: 'Elgato Stream Deck MK.2 15 Teclas LCD',
    category: 'Audio & Streaming',
    price: 890000,
    images: [
      'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800&q=80',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&q=80'
    ],
    rating: 4.9,
    reviews: 167,
    stock: 12,
    badge: 'Más vendido',
    badgeColor: '#9146FF',
    sku: '900034567',
    description: 'Controlador de streaming profesional con 15 teclas LCD personalizables. Control total de tu setup de streaming, edición de video y productividad.',
    specifications: [
      { label: 'Teclas LCD', value: '15 teclas personalizables' },
      { label: 'Conectividad', value: 'USB-C' },
      { label: 'Compatibilidad', value: 'Windows, macOS' },
      { label: 'Software', value: 'Elgato Stream Deck' },
      { label: 'Integraciones', value: 'OBS, Streamlabs, Twitch, YouTube' }
    ],
    features: [
      '15 teclas LCD personalizables',
      'Integración con OBS, Streamlabs y más',
      'Acciones ilimitadas con carpetas',
      'Plugins para apps populares',
      'Control de luces, audio y escenas'
    ]
  },
  {
    id: 10,
    name: 'Apple AirPods Pro 2da Gen USB-C',
    category: 'Apple',
    price: 1150000,
    images: [
      'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&q=80',
      'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&q=80'
    ],
    rating: 4.8,
    reviews: 892,
    stock: 34,
    sku: '100045678',
    description: 'AirPods Pro de segunda generación con cancelación activa de ruido, audio espacial personalizado y estuche de carga MagSafe con USB-C.',
    specifications: [
      { label: 'Chip', value: 'Apple H2' },
      { label: 'Cancelación de ruido', value: 'Activa avanzada' },
      { label: 'Audio espacial', value: 'Personalizado con seguimiento de cabeza' },
      { label: 'Batería audífonos', value: 'Hasta 6 horas' },
      { label: 'Batería total', value: 'Hasta 30 horas con estuche' },
      { label: 'Resistencia', value: 'IPX4 (resistente al sudor)' },
      { label: 'Conectividad', value: 'Bluetooth 5.3' }
    ],
    features: [
      'Chip H2 para audio de alta calidad',
      'Cancelación activa de ruido 2x mejor',
      'Audio espacial personalizado',
      'Modo de transparencia adaptativo',
      'Estuche MagSafe con USB-C'
    ]
  },
  {
    id: 11,
    name: 'ASUS ROG Strix Helios GX601 Case Gaming RGB',
    category: 'Componentes PC',
    price: 1280000,
    images: [
      'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=800&q=80',
      'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80',
      'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&q=80'
    ],
    rating: 4.6,
    reviews: 124,
    stock: 8,
    sku: '110056789',
    description: 'Case gaming de torre completa con paneles de vidrio templado, iluminación AURA Sync RGB y espacio para sistemas de refrigeración de alto rendimiento.',
    specifications: [
      { label: 'Tipo', value: 'Torre completa ATX' },
      { label: 'Material', value: 'Aluminio y vidrio templado' },
      { label: 'Bahías', value: '4x 3.5", 6x 2.5"' },
      { label: 'Slots expansión', value: '8 + 2 vertical' },
      { label: 'Ventiladores', value: '3x 140mm incluidos' },
      { label: 'RGB', value: 'ASUS AURA Sync' },
      { label: 'Dimensiones', value: '625 x 278 x 560 mm' }
    ],
    features: [
      'Diseño premium con vidrio templado',
      'Iluminación AURA Sync RGB',
      'Soporte para GPUs de hasta 420mm',
      'Sistema de refrigeración optimizado',
      'Paneles modulares para fácil acceso'
    ]
  },
  {
    id: 12,
    name: 'Razer BlackWidow V4 Pro Teclado Mecánico',
    category: 'Accesorios',
    price: 980000,
    originalPrice: 1200000,
    images: [
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80'
    ],
    rating: 4.7,
    reviews: 456,
    stock: 19,
    badge: 'Oferta',
    badgeColor: '#EF4444',
    sku: '120067890',
    description: 'Teclado mecánico gaming profesional con switches Razer Green, RGB Chroma y 8 macros programables. Incluye reposamuñecas magnético y control multimedia.',
    specifications: [
      { label: 'Switches', value: 'Razer Green Mechanical' },
      { label: 'Iluminación', value: 'Razer Chroma RGB' },
      { label: 'Teclas macro', value: '8 programables' },
      { label: 'Control multimedia', value: 'Dial multifunción + teclas' },
      { label: 'Conectividad', value: 'USB-A + USB passthrough' },
      { label: 'Reposamuñecas', value: 'Magnético ergonómico incluido' },
      { label: 'Cable', value: 'Trenzado desmontable' }
    ],
    features: [
      'Switches mecánicos Razer Green',
      'RGB Chroma con 16.8 millones de colores',
      '8 teclas macro programables',
      'Dial multifunción y controles multimedia',
      'Reposamuñecas ergonómico magnético'
    ]
  }
];

export function getProductById(id: number): Product | undefined {
  console.log('Searching for product with ID:', id);
  const foundProduct = products.find(p => p.id === id);
  console.log('Product found:', foundProduct ? foundProduct.name : 'NOT FOUND');
  return foundProduct;
}
