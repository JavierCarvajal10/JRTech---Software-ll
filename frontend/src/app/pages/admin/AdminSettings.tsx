import { Store, Phone, Image, Truck, Users, Shield } from 'lucide-react';

export function AdminSettings() {
  const sections = [
    {
      icon: Store,
      title: 'Información de la Tienda',
      description: 'Nombre, dirección, horarios de atención',
      color: 'text-[#9146FF]',
      bgColor: 'bg-[#F5F0FF]'
    },
    {
      icon: Phone,
      title: 'Contacto y WhatsApp',
      description: 'Números de contacto, email, redes sociales',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Image,
      title: 'Branding',
      description: 'Logo, colores, imágenes de marca',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Truck,
      title: 'Métodos de Envío',
      description: 'Opciones de entrega, costos, tiempos',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: Users,
      title: 'Usuarios Administradores',
      description: 'Gestionar accesos al panel',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: Shield,
      title: 'Roles y Permisos',
      description: 'Configurar niveles de acceso',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">Ajustes generales del sistema</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <button
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-[#9146FF] transition-all text-left group"
            >
              <div className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${section.color}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-sm text-gray-600">{section.description}</p>
            </button>
          );
        })}
      </div>

      {/* Store Info Form Example */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Información de la Tienda</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Nombre de la Tienda
            </label>
            <input
              type="text"
              maxLength={80}
              defaultValue="JeroTech"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Teléfono WhatsApp
            </label>
            <input
              type="text"
              maxLength={20}
              defaultValue="+57 315 355 4193"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email de Contacto
            </label>
            <input
              type="email"
              maxLength={254}
              defaultValue="Vjero75@gmail.com"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Ciudad
            </label>
            <input
              type="text"
              maxLength={80}
              defaultValue="Ibagué, Tolima"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Dirección
            </label>
            <input
              type="text"
              maxLength={200}
              defaultValue="Ibagué, Tolima (atención en línea)"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Horario de Atención
            </label>
            <input
              type="text"
              maxLength={80}
              defaultValue="Lun - Sáb: 9am - 7pm"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF]"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all">
            Cancelar
          </button>
          <button className="px-6 py-2.5 bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white rounded-lg font-semibold hover:shadow-lg transition-all">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
