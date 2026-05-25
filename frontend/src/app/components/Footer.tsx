import { MapPin, MessageCircle, Instagram, Clock } from "lucide-react";
import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              <span className="text-white">JR</span>
              <span className="text-purple-500">Tech</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Tienda especializada en venta de productos tecnológicos e importaciones.
              Encuentra lo que buscas con nosotros.
            </p>
            <div className="flex gap-3">
              <a
                href="https://api.whatsapp.com/send?phone=573153554193"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#1a1a2e] rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/Jerotech_Col"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#1a1a2e] rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <h3 className="font-semibold mb-4 text-white">CATEGORÍAS</h3>
            <ul className="space-y-2.5 text-gray-400 text-sm">
              <li>
                <Link to="/catalogo" className="hover:text-purple-500 transition-colors inline-block">
                  Ver catálogo
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-purple-500 transition-colors inline-block">
                  Apple
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-500 transition-colors inline-block">
                  Computadores
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-500 transition-colors inline-block">
                  Componentes PC
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-500 transition-colors inline-block">
                  Audio & Streaming
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-500 transition-colors inline-block">
                  Accesorios
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-500 transition-colors inline-block">
                  Arma tu PC
                </a>
              </li>
            </ul>
          </div>

          {/* JRTech Section */}
          <div>
            <h3 className="font-semibold mb-4 text-white">JRTECH</h3>
            <ul className="space-y-2.5 text-gray-400 text-sm">
              <li>
                <Link to="/importaciones" className="hover:text-purple-500 transition-colors inline-block">
                  Importaciones
                </Link>
              </li>
              <li>
                <Link to="/arma-tu-pc" className="hover:text-purple-500 transition-colors inline-block">
                  Arma tu PC
                </Link>
              </li>
              <li>
                <Link to="/mis-pedidos" className="hover:text-purple-500 transition-colors inline-block">
                  Mis pedidos
                </Link>
              </li>
              <li>
                <Link to="/favoritos" className="hover:text-purple-500 transition-colors inline-block">
                  Favoritos
                </Link>
              </li>
              <li>
                <Link to="/perfil" className="hover:text-purple-500 transition-colors inline-block">
                  Mi perfil
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="font-semibold mb-4 text-white">CONTACTO</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#1a1a2e] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-sm min-w-0">
                  <div className="text-gray-500 text-xs uppercase tracking-wide">UBICACIÓN</div>
                  <div className="text-gray-300 mt-0.5">Ibagué, Tolima</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#1a1a2e] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-sm min-w-0">
                  <div className="text-gray-500 text-xs uppercase tracking-wide">WHATSAPP</div>
                  <a
                    href="https://api.whatsapp.com/send?phone=573153554193"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-purple-500 transition-colors inline-block mt-0.5"
                  >
                    +57 315 355 4193
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#1a1a2e] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-sm min-w-0">
                  <div className="text-gray-500 text-xs uppercase tracking-wide">INSTAGRAM</div>
                  <a
                    href="https://www.instagram.com/Jerotech_Col"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-purple-500 transition-colors inline-block mt-0.5 break-all"
                  >
                    @Jerotech_Col
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#1a1a2e] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-sm min-w-0">
                  <div className="text-gray-500 text-xs uppercase tracking-wide">HORARIO</div>
                  <div className="text-gray-300 mt-0.5">Lun – Sáb</div>
                  <div className="text-gray-300">9am – 7pm</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-gray-500">
            <div className="text-center sm:text-left">© 2025 JRTech Todos los derechos reservados - Ibagué, Colombia</div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-center">
              <a href="#" className="hover:text-purple-500 transition-colors whitespace-nowrap">
                Términos y condiciones
              </a>
              <a href="#" className="hover:text-purple-500 transition-colors whitespace-nowrap">
                Política de privacidad
              </a>
              <a href="#" className="hover:text-purple-500 transition-colors whitespace-nowrap">
                Política de devoluciones
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
