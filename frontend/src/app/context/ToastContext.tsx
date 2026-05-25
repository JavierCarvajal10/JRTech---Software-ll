import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  showSuccess: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
  showToast: (productName: string) => void; // compat
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const STYLES: Record<ToastType, { border: string; bg: string; iconBg: string; iconColor: string; icon: typeof CheckCircle }> = {
  success: {
    border: 'border-green-500',
    bg: 'bg-white',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    icon: CheckCircle,
  },
  error: {
    border: 'border-red-500',
    bg: 'bg-white',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    icon: AlertCircle,
  },
  info: {
    border: 'border-blue-500',
    bg: 'bg-white',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: Info,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((type: ToastType, title: string, description?: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, type === 'error' ? 5000 : 3000);
  }, []);

  const showSuccess = useCallback((title: string, description?: string) => {
    push('success', title, description);
  }, [push]);

  const showError = useCallback((title: string, description?: string) => {
    push('error', title, description);
  }, [push]);

  const showInfo = useCallback((title: string, description?: string) => {
    push('info', title, description);
  }, [push]);

  const showToast = useCallback((productName: string) => {
    push('success', 'Producto agregado al carrito', productName);
  }, [push]);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, showToast }}>
      {children}

      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((toast) => {
          const style = STYLES[toast.type];
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              className={`${style.bg} border-2 ${style.border} rounded-xl shadow-lg p-4 min-w-[320px] max-w-md animate-slideIn flex items-start gap-3`}
            >
              <div className={`w-10 h-10 ${style.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${style.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 mb-1">{toast.title}</p>
                {toast.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
