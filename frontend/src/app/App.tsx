import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./routes.tsx";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import { AccessibilityMenu } from "./components/AccessibilityMenu";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccessibilityProvider>
          <CartProvider>
            <ToastProvider>
              <RouterProvider router={router} />
              {/* Menú flotante de accesibilidad: visible en todas las páginas. */}
              <AccessibilityMenu />
            </ToastProvider>
          </CartProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}