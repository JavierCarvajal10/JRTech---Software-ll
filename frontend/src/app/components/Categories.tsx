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
  const categories: Category[] = [
    {
      name: 'Apple',
      color: '#10B981', // verde
      totalProducts: 8,
      subcategories: [
        { name: 'iPhone', count: 0, icon: <Smartphone className="w-5 h-5" /> },
        { name: 'Mac / MacBook', count: 0, icon: <Laptop className="w-5 h-5" /> },
        { name: 'Apple Watch', count: 0, icon: <Watch className="w-5 h-5" /> },
        { name: 'AirPods', count: 0, icon: <Headphones className="w-5 h-5" /> },
        { name: 'iPad / Accesorios', count: 0, icon: <Smartphone className="w-5 h-5" /> },
      ]
    },
    {
      name: 'Computadores',
      color: '#3B82F6', // azul
      totalProducts: 10,
      subcategories: [
        { name: 'Laptops', count: 1, icon: <Laptop className="w-5 h-5" /> },
        { name: 'Monitores', count: 2, icon: <Monitor className="w-5 h-5" /> },
        { name: 'Mouse', count: 2, icon: <Mouse className="w-5 h-5" /> },
        { name: 'Teclados', count: 3, icon: <Keyboard className="w-5 h-5" /> },
        { name: 'Cables', count: 4, icon: <Cable className="w-5 h-5" /> },
      ]
    },
    {
      name: 'Componentes PC',
      color: '#F97316', // naranja
      totalProducts: 24,
      subcategories: [
        { name: 'GPU Gráficas', count: 5, icon: <Cpu className="w-5 h-5" /> },
        { name: 'Procesadores', count: 1, icon: <Cpu className="w-5 h-5" /> },
        { name: 'Boards', count: 6, icon: <Cpu className="w-5 h-5" /> },
        { name: 'RAM', count: 3, icon: <HardDrive className="w-5 h-5" /> },
        { name: 'Almacenamiento', count: 5, icon: <HardDrive className="w-5 h-5" /> },
        { name: 'Fuentes de poder', count: 2, icon: <Zap className="w-5 h-5" /> },
        { name: 'Refri. líquida y aire', count: 2, icon: <Droplet className="w-5 h-5" /> },
      ]
    },
    {
      name: 'Audio & Streaming',
      color: '#10B981', // verde
      totalProducts: 16,
      subcategories: [
        { name: 'Audífonos', count: 5, icon: <Headphones className="w-5 h-5" /> },
        { name: 'Micrófonos', count: 3, icon: <Mic className="w-5 h-5" /> },
        { name: 'Parlantes', count: 1, icon: <Speaker className="w-5 h-5" /> },
        { name: 'Cámaras', count: 2, icon: <Camera className="w-5 h-5" /> },
        { name: 'Dispo. Streaming', count: 3, icon: <Gamepad2 className="w-5 h-5" /> },
        { name: 'Alexas', count: 5, icon: <Speaker className="w-5 h-5" /> },
      ]
    },
    {
      name: 'Accesorios',
      color: '#EAB308', // amarillo
      totalProducts: 9,
      subcategories: [
        { name: 'Mouse', count: 2, icon: <Mouse className="w-5 h-5" /> },
        { name: 'Teclados', count: 3, icon: <Keyboard className="w-5 h-5" /> },
        { name: 'Cables', count: 4, icon: <Cable className="w-5 h-5" /> },
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
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#9146FF] group"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#9146FF] transition-colors">
                    {category.name}
                  </h3>
                </div>
                <div className="text-sm font-semibold px-3 py-1 rounded-full bg-purple-50 text-[#9146FF]">
                  {category.totalProducts} prods
                </div>
              </div>

              {/* Subcategories List */}
              <div className="space-y-3">
                {category.subcategories.map((subcategory, subIndex) => (
                  <div 
                    key={subIndex}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer group/item"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-600 group-hover/item:text-[#9146FF] transition-colors">
                        {subcategory.icon}
                      </div>
                      <span className="text-gray-700 font-medium group-hover/item:text-[#9146FF] transition-colors">
                        {subcategory.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      {subcategory.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}