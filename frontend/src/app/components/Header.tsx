import { useState, useLayoutEffect } from 'react';
import headerVideo from '../../assets/videoHeader.mp4';
import posterImage from '../../assets/imagenHeader.png';
import { Link } from 'react-router';

export function Header() {
  // En tablet/escritorio el banner debe llenar el alto del viewport menos el
  // navbar. La altura del navbar varía (en escritorio tiene una segunda fila
  // de categorías), así que la MEDIMOS en runtime para que el cálculo sea
  // exacto en cualquier dispositivo. En móvil (<640px) se deja en altura
  // automática, porque ahí el video va apilado con el texto y se ve bien.
  const [bannerHeight, setBannerHeight] = useState<string | undefined>(undefined);

  useLayoutEffect(() => {
    const updateHeight = () => {
      const isMobile = window.innerWidth < 640; // breakpoint sm de Tailwind
      if (isMobile) {
        setBannerHeight(undefined);
        return;
      }
      const navHeight = document.querySelector('nav')?.offsetHeight ?? 0;
      setBannerHeight(`calc(100vh - ${navHeight}px)`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const fillsScreen = bannerHeight !== undefined;

  return (
    <header
      className="relative w-full bg-[#F5F0FF] overflow-hidden"
      style={{ height: bannerHeight }}
    >
      {/* Video del banner: se reproduce solo, en silencio y en bucle.
          - autoPlay + muted: necesario para que los navegadores permitan
            la reproducción automática.
          - playsInline: evita que iOS lo abra en pantalla completa.
          - poster: muestra la imagen mientras el video carga.
          - Móvil: h-auto + object-contain (respeta la proporción).
          - Tablet/escritorio: h-full + object-cover, así CUBRE todo el alto
            calculado y no queda ninguna franja vacía debajo. */}
      <video
        src={headerVideo}
        poster={posterImage}
        autoPlay
        muted
        loop
        playsInline
        aria-label="Productos tecnológicos"
        className={`block w-full mx-auto ${
          fillsScreen ? 'h-full object-cover object-center' : 'h-auto object-contain'
        }`}
      />

      {/* Texto del banner.
          - Móvil: fluye debajo del video (apilado).
          - sm en adelante: se superpone sobre el video, alineado a la izquierda. */}
      <div className="static sm:absolute sm:inset-0 flex items-center px-6 sm:px-10 lg:px-16 py-8 sm:py-0">
        <div className="max-w-xl text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] mb-3 sm:mb-4 leading-tight">
            Encuentra todos tus<br />
            productos <span className="text-[#9146FF]">tecnológicos</span><br />
            en un solo lugar.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#1f2937] mb-5 sm:mb-6 font-medium">
            ¿No lo encuentras? Te lo podemos traer.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link to="/catalogo" className="bg-[#9146FF] hover:bg-[#772CE8] text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-center text-sm sm:text-base">
              Ver catálogo
            </Link>
            <Link to="/importaciones" className="bg-white hover:bg-[#F5F0FF] text-[#9146FF] border-2 border-[#9146FF] font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 text-center text-sm sm:text-base">
              Importar
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
