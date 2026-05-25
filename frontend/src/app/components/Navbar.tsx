import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { UserDropdown } from './UserDropdown';
import { FIELD_LIMITS } from '../lib/validation';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { isAuthenticated } = useAuth();

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Top Row - Logo, Search and Actions */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="text-3xl font-extrabold whitespace-nowrap tracking-tight">
            <span className="text-gray-900">Jero</span>
            <span className="text-[#9146FF]">Tech</span>
          </Link>

          {/* Large Search Bar - Desktop - Centered */}
          <div className="hidden md:flex flex-1 justify-center max-w-2xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar portátiles, teléfonos, componentes..."
                value={searchQuery}
                maxLength={FIELD_LIMITS.searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  navigate(`/catalogo?search=${encodeURIComponent(e.target.value)}`);
                }}
                className="w-full px-6 py-3.5 pl-12 pr-4 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] focus:bg-white transition-all hover:bg-white"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <Link to="/carrito" className="flex items-center gap-2.5 text-gray-700 hover:text-[#9146FF] transition-colors group">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#9146FF] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </div>
              <span className="hidden lg:block font-semibold">Carrito</span>
            </Link>

            {/* Account Button / User Dropdown */}
            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all">
                <User className="w-5 h-5" />
                <span className="font-semibold">Cuenta</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-gray-700 hover:text-[#9146FF] transition-colors p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Second Row - Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center justify-center mt-5 pt-5 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <Link to="/catalogo" className="px-4 py-2 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-medium">
              Catálogo
            </Link>
            <Link to={`/catalogo?category=${encodeURIComponent('Apple')}`} className="px-4 py-2 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-medium">
              Apple
            </Link>
            <Link to={`/catalogo?category=${encodeURIComponent('Computadores')}`} className="px-4 py-2 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-medium">
              Computadores
            </Link>
            <Link to={`/catalogo?category=${encodeURIComponent('Componentes PC')}`} className="px-4 py-2 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-medium">
              Componentes PC
            </Link>
            <Link to={`/catalogo?category=${encodeURIComponent('Audio & Streaming')}`} className="px-4 py-2 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-medium">
              Audio & Streaming
            </Link>
            <Link to={`/catalogo?category=${encodeURIComponent('Accesorios')}`} className="px-4 py-2 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-medium">
              Accesorios
            </Link>
            <Link to="/importaciones" className="px-4 py-2 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-medium">
              Importaciones
            </Link>

            {/* CTA Button */}
            <Link to="/arma-tu-pc" className="ml-2 bg-gradient-to-r from-[#9146FF] to-[#772CE8] hover:from-[#772CE8] hover:to-[#9146FF] text-white px-6 py-2.5 rounded-lg transition-all font-bold shadow-lg shadow-[#9146FF]/30 hover:shadow-[#9146FF]/50 hover:scale-105">Arma tú PC</Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            {/* Mobile Search Bar */}
            <div className="mb-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  maxLength={FIELD_LIMITS.searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    navigate(`/catalogo?search=${encodeURIComponent(e.target.value)}`);
                  }}
                  className="w-full px-6 py-3.5 pl-12 pr-4 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF]"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="flex flex-col gap-2">
              <Link to="/catalogo" className="px-4 py-3 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-medium" onClick={() => setIsMenuOpen(false)}>
                Catálogo completo
              </Link>
              <Link to={`/catalogo?category=${encodeURIComponent('Apple')}`} className="px-4 py-3 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-medium" onClick={() => setIsMenuOpen(false)}>
                Apple
              </Link>
              <Link to={`/catalogo?category=${encodeURIComponent('Computadores')}`} className="px-4 py-3 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-medium" onClick={() => setIsMenuOpen(false)}>
                Computadores
              </Link>
              <Link to={`/catalogo?category=${encodeURIComponent('Componentes PC')}`} className="px-4 py-3 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-medium" onClick={() => setIsMenuOpen(false)}>
                Componentes PC
              </Link>
              <Link to={`/catalogo?category=${encodeURIComponent('Audio & Streaming')}`} className="px-4 py-3 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-medium" onClick={() => setIsMenuOpen(false)}>
                Audio & Streaming
              </Link>
              <Link to={`/catalogo?category=${encodeURIComponent('Accesorios')}`} className="px-4 py-3 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-medium" onClick={() => setIsMenuOpen(false)}>
                Accesorios
              </Link>
              <Link to="/importaciones" className="px-4 py-3 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-medium" onClick={() => setIsMenuOpen(false)}>
                Importaciones
              </Link>
              <Link to="/arma-tu-pc" className="px-4 py-3 bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white hover:from-[#772CE8] hover:to-[#9146FF] rounded-lg transition-all font-bold" onClick={() => setIsMenuOpen(false)}>
                Arma tú PC
              </Link>


              {isAuthenticated ? (
                <div className="border-t border-gray-200 mt-2 pt-4">
                  <UserDropdown />
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-medium border-t border-gray-200 mt-2 pt-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span>Mi Cuenta</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}