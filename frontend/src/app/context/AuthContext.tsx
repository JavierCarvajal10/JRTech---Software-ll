import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  fetchMe,
  userHasRole,
  type AuthUser as BackendUser,
  type RegisterInput,
  type Role,
} from '../api/auth';

export type { Role };

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterFormInput) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  justLoggedIn: boolean;
  clearJustLoggedIn: () => void;
}

export interface RegisterFormInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapBackendUser = (b: BackendUser): User => ({
  id: b.id,
  firstName: b.primerNombre,
  lastName: b.primerApellido,
  email: b.email,
  role: b.rol,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Al montar, intentamos rehidratar la sesión usando la cookie httpOnly.
  // Si no hay cookie válida, /me devuelve 401 y nos quedamos sin usuario.
  useEffect(() => {
    fetchMe()
      .then((b) => setUser(mapBackendUser(b)))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    const u = mapBackendUser(res.user);
    setUser(u);
    setJustLoggedIn(true);
    return u;
  }, []);

  const register = useCallback(async (input: RegisterFormInput) => {
    const payload: RegisterInput = {
      email: input.email,
      password: input.password,
      primerNombre: input.firstName,
      primerApellido: input.lastName,
    };
    const res = await apiRegister(payload);
    const u = mapBackendUser(res.user);
    setUser(u);
    setJustLoggedIn(true);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Aun si falla la llamada (red caída), limpiamos el estado local.
    }
    setUser(null);
    setJustLoggedIn(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const b = await fetchMe();
    setUser(mapBackendUser(b));
  }, []);

  const clearJustLoggedIn = useCallback(() => setJustLoggedIn(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: userHasRole(user?.role, 'ADMIN'),
        isOwner: userHasRole(user?.role, 'OWNER'),
        login,
        register,
        logout,
        refreshUser,
        justLoggedIn,
        clearJustLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
