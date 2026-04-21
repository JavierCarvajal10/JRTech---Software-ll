import {
  Smartphone,
  Laptop,
  Monitor,
  Mouse,
  Keyboard,
  Cable,
  Cpu,
  HardDrive,
  Zap,
  Droplet,
  Fan,
  Headphones,
  Mic,
  Speaker,
  Camera,
  Gamepad2,
  Watch
} from 'lucide-react';
import { Link } from 'react-router';
import { products as allProducts } from '../data/products';

interface SubCategory {
  name: string;
  count: number;
  icon: React.ReactNode;
}

interface Category {
  name: string;
  color: string;
  totalProducts: number;
  subcategories: SubCategory[];
}

export function Categories() {
  // Helper function to count products by subcategory
  const countBySubcategory = (subcategoryName: string): number => {
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(subcategoryName.toLowerCase())
    ).length;
  };

  // Helper function to count products by category
  const countByCategory = (categoryName: string): number => {
    return allProducts.filter(p => p.category === categoryName).length;
  };

  const categories: Category[] = [
    {
      name: 'Apple',
      color: '#10B981', // verde
      totalProducts: countByCategory('Apple'),
      subcategories: [
        { name: 'iPhone', count: countBySubcategory('iPhone'), icon: <Smartphone className="w-5 h-5" /> },
        { name: 'MacBook', count: countBySubcategory('MacBook'), icon: <Laptop className="w-5 h-5" /> },
        { name: 'Apple Watch', count: countBySubcategory('Apple Watch'), icon: <Watch className="w-5 h-5" /> },
        { name: 'AirPods', count: countBySubcategory('AirPods'), icon: <Headphones className="w-5 h-5" /> },
        { name: 'iPad', count: countBySubcategory('iPad'), icon: <Smartphone className="w-5 h-5" /> },
      ]
    },
    {
      name: 'Computadores',
      color: '#3B82F6', // azul
      totalProducts: countByCategory('Computadores'),
      subcategories: [
        { name: 'Laptops', count: countBySubcategory('Laptop'), icon: <Laptop className="w-5 h-5" /> },
        { name: 'Monitores', count: countBySubcategory('Monitor'), icon: <Monitor className="w-5 h-5" /> },
        { name: 'Mouse', count: countBySubcategory('Mouse'), icon: <Mouse className="w-5 h-5" /> },
        { name: 'Teclados', count: countBySubcategory('Teclado'), icon: <Keyboard className="w-5 h-5" /> },
        { name: 'Cables', count: countBySubcategory('Cable'), icon: <Cable className="w-5 h-5" /> },
      ]
    },
    {
      name: 'Componentes PC',
      color: '#F97316', // naranja
      totalProducts: countByCategory('Componentes PC'),
      subcategories: [
        { name: 'GPU Gráficas', count: countBySubcategory('RTX') + countBySubcategory('GPU'), icon: <Cpu className="w-5 h-5" /> },
        { name: 'Procesadores', count: countBySubcategory('Ryzen') + countBySubcategory('Intel'), icon: <Cpu className="w-5 h-5" /> },
        { name: 'Boards', count: countBySubcategory('Board') + countBySubcategory('Motherboard'), icon: <Cpu className="w-5 h-5" /> },
        { name: 'RAM', count: countBySubcategory('RAM'), icon: <HardDrive className="w-5 h-5" /> },
        { name: 'Almacenamiento', count: countBySubcategory('SSD') + countBySubcategory('NVMe'), icon: <HardDrive className="w-5 h-5" /> },
        { name: 'Fuentes de poder', count: countBySubcategory('Fuente') + countBySubcategory('Power Supply'), icon: <Zap className="w-5 h-5" /> },
        { name: 'Refri. líquida', count: countBySubcategory('Cooler') + countBySubcategory('Refrigeración'), icon: <Droplet className="w-5 h-5" /> },
      ]
    },
    {
      name: 'Audio & Streaming',
      color: '#10B981', // verde
      totalProducts: countByCategory('Audio & Streaming'),
      subcategories: [
        { name: 'Audífonos', count: countBySubcategory('Audífono') + countBySubcategory('Headphone'), icon: <Headphones className="w-5 h-5" /> },
        { name: 'Micrófonos', count: countBySubcategory('Micrófono') + countBySubcategory('Mic'), icon: <Mic className="w-5 h-5" /> },
        { name: 'Parlantes', count: countBySubcategory('Parlante') + countBySubcategory('Speaker'), icon: <Speaker className="w-5 h-5" /> },
        { name: 'Cámaras', count: countBySubcategory('Cámara') + countBySubcategory('Camera'), icon: <Camera className="w-5 h-5" /> },
        { name: 'Stream Deck', count: countBySubcategory('Stream Deck'), icon: <Gamepad2 className="w-5 h-5" /> },
        { name: 'Luces', count: countBySubcategory('Ring Light') + countBySubcategory('Luz'), icon: <Speaker className="w-5 h-5" /> },
      ]
    },
    {
      name: 'Accesorios',
      color: '#EAB308', // amarillo
      totalProducts: countByCategory('Accesorios'),
      subcategories: [
        { name: 'Mouse', count: countBySubcategory('Mouse'), icon: <Mouse className="w-5 h-5" /> },
        { name: 'Teclados', count: countBySubcategory('Teclado') + countBySubcategory('Keyboard'), icon: <Keyboard className="w-5 h-5" /> },
        { name: 'Cables', count: countBySubcategory('Cable'), icon: <Cable className="w-5 h-5" /> },
      ]
    }
  ];

  return (
    <section className="w-full bg-gradient-to-b from-white to-purple-50 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Categorías
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={`/catalogo?category=${encodeURIComponent(category.name)}`}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-[#9146FF] active:scale-95 group block cursor-pointer"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#9146FF] transition-colors">
                    {category.name}
                  </h3>
                </div>
                <div className="text-sm font-semibold px-3 py-1 rounded-full bg-purple-50 text-[#9146FF] group-hover:bg-[#9146FF] group-hover:text-white transition-colors">
                  {category.totalProducts} prods
                </div>
              </div>

              {/* Subcategories List */}
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                {category.subcategories.map((subcategory, subIndex) => (
                  <Link
                    key={subIndex}
                    to={`/catalogo?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(subcategory.name)}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-purple-100 transition-all cursor-pointer group/item active:scale-95"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-600 group-hover/item:text-[#9146FF] transition-colors">
                        {subcategory.icon}
                      </div>
                      <span className="text-gray-700 font-medium group-hover/item:text-gray-900 transition-colors">
                        {subcategory.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 font-medium group-hover/item:text-[#9146FF] transition-colors">
                      {subcategory.count}
                    </span>
                  </Link>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}