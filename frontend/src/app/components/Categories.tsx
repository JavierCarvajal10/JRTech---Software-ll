import { useMemo } from 'react';
import { Link } from 'react-router';
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
  Headphones,
  Mic,
  Speaker,
  Camera,
  Gamepad2,
  Watch,
  Folder,
  Loader2,
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { buildCategoryTree } from '../api/categories';

const PARENT_COLORS: Record<string, string> = {
  Apple: '#10B981',
  Computadores: '#3B82F6',
  'Componentes PC': '#F97316',
  'Audio & Streaming': '#10B981',
  Accesorios: '#EAB308',
};

const SUBCATEGORY_ICONS: Record<string, React.ReactNode> = {
  iPhone: <Smartphone className="w-5 h-5" />,
  'Mac / MacBook': <Laptop className="w-5 h-5" />,
  'Apple Watch': <Watch className="w-5 h-5" />,
  AirPods: <Headphones className="w-5 h-5" />,
  'iPad / Accesorios': <Smartphone className="w-5 h-5" />,
  Laptops: <Laptop className="w-5 h-5" />,
  Monitores: <Monitor className="w-5 h-5" />,
  Mouse: <Mouse className="w-5 h-5" />,
  Teclados: <Keyboard className="w-5 h-5" />,
  Cables: <Cable className="w-5 h-5" />,
  'GPU Gráficas': <Cpu className="w-5 h-5" />,
  Procesadores: <Cpu className="w-5 h-5" />,
  Boards: <Cpu className="w-5 h-5" />,
  RAM: <HardDrive className="w-5 h-5" />,
  Almacenamiento: <HardDrive className="w-5 h-5" />,
  'Fuentes de poder': <Zap className="w-5 h-5" />,
  'Refri. líquida y aire': <Droplet className="w-5 h-5" />,
  Audífonos: <Headphones className="w-5 h-5" />,
  Micrófonos: <Mic className="w-5 h-5" />,
  Parlantes: <Speaker className="w-5 h-5" />,
  Cámaras: <Camera className="w-5 h-5" />,
  'Dispo. Streaming': <Gamepad2 className="w-5 h-5" />,
  Alexas: <Speaker className="w-5 h-5" />,
};

export function Categories() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: products = [] } = useProducts();

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);

  const productsByCategoryId = useMemo(() => {
    const map = new Map<number, number>();
    products.forEach((p) => {
      if (p.categoryId !== null) {
        map.set(p.categoryId, (map.get(p.categoryId) ?? 0) + 1);
      }
    });
    return map;
  }, [products]);

  const productsByParentName = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const parent = p.categoryParent ?? p.category;
      if (parent && parent !== 'Sin categoría') {
        map.set(parent, (map.get(parent) ?? 0) + 1);
      }
    });
    return map;
  }, [products]);

  return (
    <section className="w-full bg-gradient-to-b from-white to-purple-50 dark:from-gray-950 dark:to-gray-900 py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Categorías
          </h2>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin text-[#9146FF]" />
            <span>Cargando categorías…</span>
          </div>
        ) : tree.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            Aún no hay categorías. Créalas desde el panel de administrador.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tree.map((node) => {
              const color = PARENT_COLORS[node.parent.name] ?? '#9146FF';
              const total = productsByParentName.get(node.parent.name) ?? 0;
              return (
                <div
                  key={node.parent.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#9146FF] group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      ></div>
                      <Link
                        to={`/catalogo?category=${encodeURIComponent(node.parent.name)}`}
                        className="text-xl font-bold text-gray-900 group-hover:text-[#9146FF] transition-colors"
                      >
                        {node.parent.name}
                      </Link>
                    </div>
                    <div className="text-sm font-semibold px-3 py-1 rounded-full bg-purple-50 text-[#9146FF]">
                      {total} prods
                    </div>
                  </div>

                  <div className="space-y-3">
                    {node.subcategories.map((sub) => {
                      const count = productsByCategoryId.get(sub.id) ?? 0;
                      const icon =
                        SUBCATEGORY_ICONS[sub.name] ?? (
                          <Folder className="w-5 h-5" />
                        );
                      return (
                        <Link
                          key={sub.id}
                          to={`/catalogo?category=${encodeURIComponent(node.parent.name)}&subcategory=${encodeURIComponent(sub.name)}`}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer group/item"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-gray-600 group-hover/item:text-[#9146FF] transition-colors">
                              {icon}
                            </div>
                            <span className="text-gray-700 font-medium group-hover/item:text-[#9146FF] transition-colors">
                              {sub.name}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 font-medium">
                            {count}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
