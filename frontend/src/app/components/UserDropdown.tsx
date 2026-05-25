import { useState, useRef, useEffect } from 'react';
import { User, Package, Heart, LogOut, ChevronDown, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
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

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-[#9146FF] hover:bg-gray-50 rounded-lg transition-all group"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-[#9146FF] to-[#772CE8] rounded-full flex items-center justify-center text-white font-bold text-sm">
          {user.firstName.charAt(0).toUpperCase()}
        </div>
        <span className="hidden lg:block font-semibold">{user.firstName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
            {isAdmin && (
              <span className="inline-block mt-1.5 px-2 py-0.5 bg-purple-100 text-[#9146FF] text-xs font-bold rounded-full">
                ADMIN
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[#9146FF] hover:bg-purple-50 transition-colors"
              >
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Panel admin</span>
              </Link>
            )}

            <Link
              to="/perfil"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#9146FF] transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Mi perfil</span>
            </Link>

            <Link
              to="/mis-pedidos"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#9146FF] transition-colors"
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">Mis pedidos</span>
            </Link>

            <Link
              to="/favoritos"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#9146FF] transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="font-medium">Favoritos</span>
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
  );
}
