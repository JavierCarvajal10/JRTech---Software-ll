import { Search, Bell, Menu, ExternalLink, ChevronDown, User, LogOut, Crown, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout, isOwner } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/');
  };

  const initial = user?.firstName?.charAt(0).toUpperCase() ?? 'A';
  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'Administrador';

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="h-full px-3 sm:px-6 flex items-center justify-between gap-2">
        {/* Left - Mobile Menu + Search */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="relative max-w-md w-full hidden sm:block">
            <input
              type="text"
              placeholder="Buscar productos, pedidos, clientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ver tienda */}
          <Link
            to="/"
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all font-semibold text-sm"
            title="Ir a la tienda"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden md:inline">Ver tienda</span>
          </Link>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Admin Profile + Dropdown */}
          <div className="relative pl-2 sm:pl-3 border-l border-gray-200" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 sm:gap-3 p-1 pr-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-[#9146FF] to-[#772CE8] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {initial}
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-gray-900 leading-tight">{fullName}</div>
                <div className="text-xs text-gray-500">{user?.email ?? ''}</div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform hidden sm:block ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="font-semibold text-gray-900">{fullName}</div>
                  <div className="text-sm text-gray-600 break-all">{user?.email}</div>
                  {isOwner ? (
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                      <Crown className="w-3 h-3" /> OWNER
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-purple-100 text-[#9146FF] text-xs font-bold rounded-full border border-purple-200">
                      <ShieldCheck className="w-3 h-3" /> ADMIN
                    </span>
                  )}
                </div>

                {/* Menu items */}
                <div className="py-2">
                  <Link
                    to="/perfil"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#9146FF] transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Mi cuenta</span>
                  </Link>

                  <Link
                    to="/"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#9146FF] transition-colors sm:hidden"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span className="font-medium">Ver tienda</span>
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
