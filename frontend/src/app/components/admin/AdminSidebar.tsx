import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Package,
  BarChart3,
  ShoppingCart,
  Users,
  ShieldCheck,
  Monitor,
  Globe,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { isOwner } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Productos', path: '/admin/productos' },
    { icon: BarChart3, label: 'Inventario', path: '/admin/inventario' },
    { icon: ShoppingCart, label: 'Pedidos', path: '/admin/pedidos' },
    { icon: Users, label: 'Clientes', path: '/admin/clientes' },
    ...(isOwner
      ? [{ icon: ShieldCheck, label: 'Usuarios', path: '/admin/usuarios' }]
      : []),
    { icon: Monitor, label: 'Arma tu PC', path: '/admin/pc-builder' },
    { icon: Globe, label: 'Importaciones', path: '/admin/importaciones' },
    { icon: TrendingUp, label: 'Reportes', path: '/admin/reportes' },
    { icon: Settings, label: 'Configuración', path: '/admin/configuracion' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
        {!isCollapsed && (
          <Link to="/admin" className="text-2xl font-extrabold">
            <span className="text-gray-900">Jero</span>
            <span className="text-[#9146FF]">Tech</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#F5F0FF] text-[#9146FF] font-semibold'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-[#9146FF]'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
