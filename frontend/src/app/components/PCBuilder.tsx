import { Cpu, MemoryStick, Zap, Check, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router';

interface ComponentCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'valid' | 'warning' | 'none';
  statusText: string;
}

export function PCBuilder() {
  const components: ComponentCard[] = [
    {
      title: 'Socket CPU + Board',
      description: 'Verifica que el procesador sea compatible con la tarjeta madre',
      icon: <Cpu className="w-8 h-8" />,
      status: 'valid',
      statusText: 'Validado automáticamente'
    },
    {
      title: 'Tipo de RAM',
      description: 'DDR4 o DDR5 según lo que soporte tu board seleccionada',
      icon: <MemoryStick className="w-8 h-8" />,
      status: 'valid',
      statusText: 'Validado automáticamente'
    },
    {
      title: 'Watts de la fuente',
      description: 'Calcula si tu fuente aguanta el consumo total del sistema',
      icon: <Zap className="w-8 h-8" />,
      status: 'warning',
      statusText: 'Te avisa si es insuficiente'
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'Elige tus componentes',
      description: 'Selecciona CPU, tarjeta madre, RAM, GPU, almacenamiento, fuente y refrigeración del catálogo de JRTech.'
    },
    {
      number: 2,
      title: 'El sistema verifica compatibilidad',
      description: 'En tiempo real analizamos todos los componentes son compatibles entre sí. Te avisa si hay un problema antes de comprar.'
    },
    {
      number: 3,
      title: 'Agrega todo al carrito',
      description: 'Con solo clic agregas todos los componentes verificados al carrito y completas tu compra.'
    }
  ];

  return (
    <section className="w-full bg-gradient-to-br from-[#0E0E10] via-[#1a1a1f] to-[#0E0E10] py-12 sm:py-16 lg:py-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-[#9146FF] opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-[#772CE8] opacity-10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Section - Title and Steps */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-10 sm:mb-16">
          {/* Left - Title and Description */}
          <div>
            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              ¿Tienes dudas a la hora<br className="hidden sm:inline" />{' '}
              de <span className="text-[#9146FF]">armar tu PC?</span>
            </h2>

            {/* Description */}
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
              Selecciona tus componentes uno a uno y nuestro sistema verifica en tiempo real si son compatibles entre sí. Sin errores, sin plata perdida.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center lg:justify-start">
              <Link to="/arma-tu-pc" className="bg-[#9146FF] hover:bg-[#772CE8] text-white font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full transition-all duration-200 shadow-lg shadow-[#9146FF]/30 hover:shadow-xl hover:shadow-[#9146FF]/40 hover:scale-105 text-sm sm:text-base">
                Empezar a armar mi PC
              </Link>
            </div>
          </div>

          {/* Right - Steps */}
          <div className="space-y-5 sm:space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                {/* Number Badge */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#9146FF] bg-opacity-20 border-2 border-[#9146FF] flex items-center justify-center">
                  <span className="text-[#BF94FF] font-bold text-lg">{step.number}</span>
                </div>
                
                {/* Content */}
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section - Component Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {components.map((component, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-2xl p-6 border border-gray-800 hover:border-[#9146FF] transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-[#9146FF] bg-opacity-10 flex items-center justify-center mb-4 group-hover:bg-opacity-20 transition-all">
                <div className="text-[#BF94FF]">
                  {component.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-white font-bold text-lg mb-2">{component.title}</h3>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">{component.description}</p>

              {/* Status */}
              <div className="flex items-center gap-2">
                {component.status === 'valid' && (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">{component.statusText}</span>
                  </>
                )}
                {component.status === 'warning' && (
                  <>
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 text-sm font-medium">{component.statusText}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}