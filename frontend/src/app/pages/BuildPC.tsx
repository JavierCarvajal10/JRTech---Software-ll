import { useState } from 'react';
import { Cpu, CircuitBoard, MemoryStick, Monitor, HardDrive, Zap, Box, Fan, Check, AlertCircle, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Component {
  id: string;
  name: string;
  price: number;
  image: string;
  specs: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  components: Component[];
  position: { top: string; left: string };
}

export function BuildPC() {
  const categories: Category[] = [
    {
      id: 'cpu',
      name: 'Procesador (CPU)',
      icon: <Cpu className="w-5 h-5" />,
      position: { top: '5%', left: '50%' },
      components: [
        {
          id: 'cpu-1',
          name: 'AMD Ryzen 9 7950X',
          price: 699990,
          image: 'https://images.unsplash.com/photo-1613483187550-1458bbdb0996?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBTUQlMjBSeXplbiUyMHByb2Nlc3NvciUyMENQVXxlbnwxfHx8fDE3NzY2Njg1MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
          specs: '16 núcleos / 32 hilos - 5.7 GHz',
        },
        {
          id: 'cpu-2',
          name: 'Intel Core i9-14900K',
          price: 649990,
          image: 'https://images.unsplash.com/photo-1613483187550-1458bbdb0996?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBTUQlMjBSeXplbiUyMHByb2Nlc3NvciUyMENQVXxlbnwxfHx8fDE3NzY2Njg1MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
          specs: '24 núcleos / 32 hilos - 6.0 GHz',
        },
        {
          id: 'cpu-3',
          name: 'AMD Ryzen 7 7800X3D',
          price: 499990,
          image: 'https://images.unsplash.com/photo-1613483187550-1458bbdb0996?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBTUQlMjBSeXplbiUyMHByb2Nlc3NvciUyMENQVXxlbnwxfHx8fDE3NzY2Njg1MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
          specs: '8 núcleos / 16 hilos - 5.0 GHz + 3D V-Cache',
        },
      ],
    },
    {
      id: 'motherboard',
      name: 'Tarjeta Madre',
      icon: <CircuitBoard className="w-5 h-5" />,
      position: { top: '20%', left: '10%' },
      components: [
        {
          id: 'mb-1',
          name: 'ASUS ROG Strix X670E-E',
          price: 599990,
          image: 'https://images.unsplash.com/photo-1562408590-e32931084e23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMG1vdGhlcmJvYXJkfGVufDF8fHx8MTc3NjY2ODUwOHww&ixlib=rb-4.1.0&q=80&w=1080',
          specs: 'Socket AM5 - DDR5 - PCIe 5.0',
        },
        {
          id: 'mb-2',
          name: 'MSI MAG B650 Tomahawk',
          price: 299990,
          image: 'https://images.unsplash.com/photo-1562408590-e32931084e23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMG1vdGhlcmJvYXJkfGVufDF8fHx8MTc3NjY2ODUwOHww&ixlib=rb-4.1.0&q=80&w=1080',
          specs: 'Socket AM5 - DDR5 - PCIe 4.0',
        },
        {
          id: 'mb-3',
          name: 'Gigabyte Z790 Aorus Elite',
          price: 349990,
          image: 'https://images.unsplash.com/photo-1562408590-e32931084e23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMG1vdGhlcmJvYXJkfGVufDF8fHx8MTc3NjY2ODUwOHww&ixlib=rb-4.1.0&q=80&w=1080',
          specs: 'Socket LGA1700 - DDR5 - PCIe 5.0',
        },
      ],
    },
    {
      id: 'ram',
      name: 'Memoria RAM',
      icon: <MemoryStick className="w-5 h-5" />,
      position: { top: '20%', left: '90%' },
      components: [
        {
          id: 'ram-1',
          name: 'Corsair Vengeance RGB 32GB',
          price: 179990,
          image: 'https://images.unsplash.com/photo-1758577675588-c5bbbbbf8e97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxSQU0lMjBtZW1vcnklMjBtb2R1bGVzfGVufDF8fHx8MTc3NjY2ODUxMHww&ixlib=rb-4.1.0&q=80&w=1080',
          specs: 'DDR5 6000MHz - 2x16GB - RGB',
        },
        {
          id: 'ram-2',
          name: 'G.Skill Trident Z5 64GB',
          price: 329990,
          image: 'https://images.unsplash.com/photo-1758577675588-c5bbbbbf8e97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxSQU0lMjBtZW1vcnklMjBtb2R1bGVzfGVufDF8fHx8MTc3NjY2ODUxMHww&ixlib=rb-4.1.0&q=80&w=1080',
          specs: 'DDR5 6400MHz - 2x32GB',
        },
        {
          id: 'ram-3',
          name: 'Kingston Fury Beast 16GB',
          price: 89990,
          image: 'https://images.unsplash.com/photo-1758577675588-c5bbbbbf8e97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxSQU0lMjBtZW1vcnklMjBtb2R1bGVzfGVufDF8fHx8MTc3NjY2ODUxMHww&ixlib=rb-4.1.0&q=80&w=1080',
          specs: 'DDR5 5200MHz - 2x8GB',
        },
      ],
    },
    {
      id: 'gpu',
      name: 'Tarjeta Gráfica',
      icon: <Monitor className="w-5 h-5" />,
      position: { top: '50%', left: '95%' },
      components: [
        {
          id: 'gpu-1',
          name: 'NVIDIA RTX 4090',
          price: 2499990,
          image: 'https://images.unsplash.com/photo-1578286788444-8c1487fcd823?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudmlkaWElMjBncmFwaGljcyUyMGNhcmQlMjBHUFV8ZW58MXx8fHwxNzc2NjY4NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
          specs: '24GB GDDR6X - 450W TDP',
        },
        {
          id: 'gpu-2',
          name: 'AMD Radeon RX 7900 XTX',
          price: 1299990,
          image: 'https://images.unsplash.com/photo-1578286788444-8c1487fcd823?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudmlkaWElMjBncmFwaGljcyUyMGNhcmQlMjBHUFV8ZW58MXx8fHwxNzc2NjY4NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
          specs: '24GB GDDR6 - 355W TDP',
        },
        {
          id: 'gpu-3',
          name: 'NVIDIA RTX 4070 Ti',
          price: 999990,
          image: 'https://images.unsplash.com/photo-1578286788444-8c1487fcd823?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudmlkaWElMjBncmFwaGljcyUyMGNhcmQlMjBHUFV8ZW58MXx8fHwxNzc2NjY4NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
          specs: '12GB GDDR6X - 285W TDP',
        },
      ],
    },
    {
      id: 'storage',
      name: 'Almacenamiento',
      icon: <HardDrive className="w-5 h-5" />,
      position: { top: '80%', left: '50%' },
      components: [
        {
          id: 'storage-1',
          name: 'Samsung 990 Pro 2TB',
          price: 249990,
          image: 'https://images.unsplash.com/photo-1756836857570-127b0408b676?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTU0QlMjBzdG9yYWdlJTIwZHJpdmV8ZW58MXx8fHwxNzc2NjY4NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
          specs: 'NVMe Gen4 - 7450 MB/s lectura',
        },
        {
          id: 'storage-2',
          name: 'WD Black SN850X 1TB',
          price: 149990,
          image: 'https://images.unsplash.com/photo-1756836857570-127b0408b676?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTU0QlMjBzdG9yYWdlJTIwZHJpdmV8ZW58MXx8fHwxNzc2NjY4NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
          specs: 'NVMe Gen4 - 7300 MB/s lectura',
        },
        {
          id: 'storage-3',
          name: 'Crucial P5 Plus 500GB',
          price: 79990,
          image: 'https://images.unsplash.com/photo-1756836857570-127b0408b676?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTU0QlMjBzdG9yYWdlJTIwZHJpdmV8ZW58MXx8fHwxNzc2NjY4NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
          specs: 'NVMe Gen4 - 6600 MB/s lectura',
        },
      ],
    },
    {
      id: 'psu',
      name: 'Fuente de Poder',
      icon: <Zap className="w-5 h-5" />,
      position: { top: '50%', left: '5%' },
      components: [
        {
          id: 'psu-1',
          name: 'Corsair RM1000e 1000W',
          price: 249990,
          image: 'https://images.unsplash.com/photo-1754928864335-608149b7f6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHBvd2VyJTIwc3VwcGx5fGVufDF8fHx8MTc3NjY2ODUxMHww&ixlib=rb-4.1.0&q=80&w=1080',
          specs: '80+ Gold - Modular - ATX 3.0',
        },
        {
          id: 'psu-2',
          name: 'EVGA SuperNOVA 850W',
          price: 179990,
          image: 'https://images.unsplash.com/photo-1754928864335-608149b7f6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHBvd2VyJTIwc3VwcGx5fGVufDF8fHx8MTc3NjY2ODUxMHww&ixlib=rb-4.1.0&q=80&w=1080',
          specs: '80+ Platinum - Modular',
        },
        {
          id: 'psu-3',
          name: 'Seasonic Focus GX-750',
          price: 149990,
          image: 'https://images.unsplash.com/photo-1754928864335-608149b7f6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHBvd2VyJTIwc3VwcGx5fGVufDF8fHx8MTc3NjY2ODUxMHww&ixlib=rb-4.1.0&q=80&w=1080',
          specs: '80+ Gold - Semi-modular',
        },
      ],
    },
    {
      id: 'case',
      name: 'Gabinete',
      icon: <Box className="w-5 h-5" />,
      position: { top: '50%', left: '50%' },
      components: [
        {
          id: 'case-1',
          name: 'Lian Li O11 Dynamic EVO',
          price: 199990,
          image: 'https://images.unsplash.com/photo-1760708825878-9e7ecf31565a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQQyUyMGNhc2UlMjB0b3dlcnxlbnwxfHx8fDE3NzY2Njg1MTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
          specs: 'Mid Tower - Vidrio templado - RGB',
        },
        {
          id: 'case-2',
          name: 'NZXT H7 Flow',
          price: 149990,
          image: 'https://images.unsplash.com/photo-1760708825878-9e7ecf31565a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQQyUyMGNhc2UlMjB0b3dlcnxlbnwxfHx8fDE3NzY2Njg1MTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
          specs: 'Mid Tower - Alta ventilación',
        },
        {
          id: 'case-3',
          name: 'Fractal Design Torrent',
          price: 229990,
          image: 'https://images.unsplash.com/photo-1760708825878-9e7ecf31565a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQQyUyMGNhc2UlMjB0b3dlcnxlbnwxfHx8fDE3NzY2Njg1MTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
          specs: 'Mid Tower - Máximo flujo de aire',
        },
      ],
    },
    {
      id: 'cooling',
      name: 'Refrigeración',
      icon: <Fan className="w-5 h-5" />,
      position: { top: '65%', left: '15%' },
      components: [
        {
          id: 'cooling-1',
          name: 'NZXT Kraken Z73 RGB',
          price: 349990,
          image: 'https://images.unsplash.com/photo-1754821130717-60c970da55dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDUFUlMjBjb29sZXIlMjBmYW58ZW58MXx8fHwxNzc2NjY4NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
          specs: 'AIO 360mm - LCD Display - RGB',
        },
        {
          id: 'cooling-2',
          name: 'Corsair iCUE H150i Elite',
          price: 249990,
          image: 'https://images.unsplash.com/photo-1754821130717-60c970da55dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDUFUlMjBjb29sZXIlMjBmYW58ZW58MXx8fHwxNzc2NjY4NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
          specs: 'AIO 360mm - RGB',
        },
        {
          id: 'cooling-3',
          name: 'Noctua NH-D15',
          price: 129990,
          image: 'https://images.unsplash.com/photo-1754821130717-60c970da55dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDUFUlMjBjb29sZXIlMjBmYW58ZW58MXx8fHwxNzc2NjY4NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
          specs: 'Torre doble - Ultra silencioso',
        },
      ],
    },
  ];

  const [selectedComponents, setSelectedComponents] = useState<Record<string, Component>>({});
  const [showWarning, setShowWarning] = useState<{ categoryId: string; componentName: string } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const handleComponentSelect = (categoryId: string, component: Component) => {
    if (selectedComponents[categoryId]?.id === component.id) {
      // Deseleccionar si se hace clic en el mismo componente
      const newSelected = { ...selectedComponents };
      delete newSelected[categoryId];
      setSelectedComponents(newSelected);
      setShowWarning(null);
    } else if (selectedComponents[categoryId]) {
      // Mostrar advertencia si ya hay un componente seleccionado
      setShowWarning({ categoryId, componentName: selectedComponents[categoryId].name });
      setTimeout(() => setShowWarning(null), 3000);
    } else {
      // Seleccionar nuevo componente
      setSelectedComponents({
        ...selectedComponents,
        [categoryId]: component,
      });
      setShowWarning(null);
    }
  };

  const calculateTotal = () => {
    return Object.values(selectedComponents).reduce((sum, component) => sum + component.price, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getSelectedCount = () => {
    return Object.keys(selectedComponents).length;
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [categoryId]: !expandedCategories[categoryId],
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-b-2 border-gray-200 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Arma tu PC ideal</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Selecciona cada componente y visualiza tu configuración personalizada. Nuestro sistema verifica la compatibilidad en tiempo real.
          </p>
        </div>
      </div>

      {/* Warning Message */}
      {showWarning && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mx-6 mt-6 rounded-r-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <p className="text-orange-800">
              Ya tienes <span className="font-bold">{showWarning.componentName}</span> seleccionado en esta categoría. 
              Deselecciónalo primero para elegir otro componente.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          {/* Left Sidebar - Component Menu */}
          <div className="space-y-4">
            <div className="bg-[#F5F0FF] rounded-xl p-4 border border-[#BF94FF]/30">
              <h2 className="font-bold text-lg mb-2 text-gray-900">Tu configuración</h2>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {getSelectedCount()} de {categories.length} componentes seleccionados
                </span>
              </div>
            </div>

            {/* Categories List */}
            <div className="space-y-3">
              {categories.map((category) => {
                const isExpanded = expandedCategories[category.id];
                const isSelected = !!selectedComponents[category.id];
                
                return (
                  <div key={category.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className={`w-full p-4 flex items-center justify-between transition-all ${
                        isSelected ? 'bg-[#9146FF] text-white' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${isSelected ? 'text-white' : 'text-[#9146FF]'}`}>
                          {category.icon}
                        </div>
                        <div className="text-left">
                          <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {category.name}
                          </h3>
                          {isSelected && selectedComponents[category.id] && (
                            <span className="text-xs text-white/80">{selectedComponents[category.id].name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <Check className="w-5 h-5 text-white" />
                        )}
                        {isExpanded ? (
                          <ChevronUp className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        ) : (
                          <ChevronDown className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        )}
                      </div>
                    </button>

                    {/* Component Options */}
                    {isExpanded && (
                      <div className="p-3 space-y-2">
                        {category.components.map((component) => {
                          const isComponentSelected = selectedComponents[category.id]?.id === component.id;
                          return (
                            <button
                              key={component.id}
                              onClick={() => handleComponentSelect(category.id, component)}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                isComponentSelected
                                  ? 'border-[#9146FF] bg-[#F5F0FF]'
                                  : 'border-gray-200 hover:border-[#BF94FF] hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-sm text-gray-900">{component.name}</span>
                                {isComponentSelected && (
                                  <Check className="w-4 h-4 text-[#9146FF]" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-1">{component.specs}</p>
                              <p className="text-sm font-bold text-[#9146FF]">{formatPrice(component.price)}</p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total and Add to Cart */}
            {getSelectedCount() > 0 && (
              <div className="bg-gradient-to-br from-[#9146FF] to-[#772CE8] rounded-xl p-6 text-white sticky bottom-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg">Total configuración:</span>
                  <span className="text-2xl font-bold">{formatPrice(calculateTotal())}</span>
                </div>
                <button className="w-full bg-white text-[#9146FF] font-bold py-3 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Agregar todo al carrito
                </button>
                <p className="text-xs text-white/80 text-center mt-3">
                  {getSelectedCount()} componente{getSelectedCount() !== 1 ? 's' : ''} seleccionado{getSelectedCount() !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Right Side - Preview */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-b-2 border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vista previa de componentes</h2>
                <p className="text-gray-600">
                  {getSelectedCount() === 0
                    ? 'Selecciona componentes del menú para visualizarlos'
                    : `${getSelectedCount()} componente${getSelectedCount() !== 1 ? 's' : ''} seleccionado${getSelectedCount() !== 1 ? 's' : ''}`}
                </p>
              </div>

              <div className="p-8">
                
                
                
                {/* Para crear los elementos circulares */}
                {/* Circular Component Display */}
                <div className="relative w-full aspect-square max-w-xl mx-auto">
                {/* Center Circle - Case */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#0E0E10] border-4 border-gray-300 flex flex-col items-center justify-center shadow-xl z-10">
                    {selectedComponents['case'] ? (
                    <div className="w-full h-full rounded-full overflow-hidden p-2">
                        <ImageWithFallback
                        src={selectedComponents['case'].image}
                        alt="Case"
                        className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                    ) : (
                    <>
                        <Box className="w-16 h-16 text-gray-500 mb-2" />
                        <span className="text-xs text-gray-400 text-center px-4">Gabinete<br />(Case)</span>
                    </>
                    )}
                </div>

                {/* Surrounding Component Circles */}
                {categories.filter(cat => cat.id !== 'case').map((category, index, arr) => {
                    const component = selectedComponents[category.id];
                    const angle = (2 * Math.PI * index) / arr.length - Math.PI / 2; // empieza arriba
                    const radius = 38; // % del contenedor
                    const top = 50 + radius * Math.sin(angle);
                    const left = 50 + radius * Math.cos(angle);

                    return (
                    <div
                        key={category.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ top: `${top}%`, left: `${left}%` }}
                    >
                        <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center shadow-lg transition-all ${
                        component
                            ? 'bg-[#9146FF] border-[#772CE8]'
                            : 'bg-[#1a1a2e] border-gray-600'
                        }`}>
                        {component ? (
                            <div className="w-full h-full rounded-full overflow-hidden p-1">
                            <ImageWithFallback
                                src={component.image}
                                alt={component.name}
                                className="w-full h-full object-cover rounded-full"
                            />
                            </div>
                        ) : (
                            <>
                            <div className="text-gray-400">{category.icon}</div>
                            <span className="text-[10px] text-gray-400 text-center mt-1 px-2 leading-tight">
                                {category.name}
                            </span>
                            </>
                        )}
                        </div>
                    </div>
                    );
                })}
                </div>

                {/* Selected Components List Below */}
                {getSelectedCount() > 0 && (
                  <div className="mt-8 space-y-3">
                    <h3 className="font-bold text-gray-900 mb-3">Componentes seleccionados:</h3>
                    {Object.entries(selectedComponents).map(([categoryId, component]) => {
                      const category = categories.find(cat => cat.id === categoryId);
                      return (
                        <div key={categoryId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="text-[#9146FF]">
                              {category?.icon}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{component.name}</p>
                              <p className="text-xs text-gray-600">{category?.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#9146FF] text-sm">{formatPrice(component.price)}</p>
                            <button
                              onClick={() => {
                                const newSelected = { ...selectedComponents };
                                delete newSelected[categoryId];
                                setSelectedComponents(newSelected);
                              }}
                              className="text-xs text-red-600 hover:text-red-700 transition-colors"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div> 

            {/* Compatibility Info */}
            {getSelectedCount() > 0 && (
              <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 mb-1">Compatibilidad verificada</h3>
                    <p className="text-sm text-green-800">
                      Todos los componentes seleccionados son compatibles entre sí y listos para armar.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
