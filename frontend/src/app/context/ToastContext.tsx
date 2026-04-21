import { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  productName: string;
}

interface ToastContextType {
  showToast: (productName: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (productName: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message: 'Producto agregado al carrito', productName }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-white border-2 border-green-500 rounded-xl shadow-lg p-4 min-w-[320px] max-w-md animate-slideIn flex items-start gap-3"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 mb-1">{toast.message}</p>
              <p className="text-sm text-gray-600 line-clamp-1">{toast.productName}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
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
