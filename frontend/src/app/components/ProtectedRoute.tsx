import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { userHasRole, type Role } from "../api/auth";

interface Props {
  children: ReactNode;
  requireRole?: Role;
}

export function ProtectedRoute({ children, requireRole }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#9146FF]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireRole && !userHasRole(user.role, requireRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso denegado</h2>
          <p className="text-gray-600 mb-6">
            Esta sección requiere rol <span className="font-semibold">{requireRole}</span>. Tu cuenta tiene rol <span className="font-semibold">{user.role}</span>.
          </p>
          <a href="/" className="text-[#9146FF] font-semibold hover:underline">
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
