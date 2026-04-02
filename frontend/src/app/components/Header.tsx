import headerImage from '/src/assets/imagenHeader.png';
import { Link } from 'react-router';

export function Header() {
  return (
    <header className="relative w-full min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Background Image - Full width and height */}
      <div className="absolute inset-0">
        <img 
          src={headerImage} 
          alt="Productos tecnológicos" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Content */}
      <div className="relative h-full min-h-[calc(100vh-80px)] max-w-7xl mx-auto px-6 py-12 flex items-center">
        <div className="max-w-2xl">
          {/* Text Content */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Encuentra todos tus productos <span className="text-[#9146FF]">tecnológicos</span> en un solo lugar.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-800 mb-6 font-medium">
            ¿No lo encuentras? Te lo podemos traer.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/catalogo" className="bg-[#9146FF] hover:bg-[#772CE8] text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-center">
              Ver catálogo
            </Link>
            <button className="bg-white hover:bg-[#F5F0FF] text-[#9146FF] border-2 border-[#9146FF] font-semibold px-8 py-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105">
              Importar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}