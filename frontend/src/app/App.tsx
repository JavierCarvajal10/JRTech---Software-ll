import { RouterProvider } from "react-router";
import { router } from "./routes.tsx";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";

export default function App() {
  return (
    <CartProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </CartProvider>
  );
}