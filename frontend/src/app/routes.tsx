import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
import { Auth } from "./pages/Auth";
import { ProductDetail } from "./pages/ProductDetail";
import { Importaciones } from "./pages/Importaciones";
import { BuildPC } from "./pages/BuildPC";
import { Cart } from "./pages/Cart";
import { MyOrders } from "./pages/MyOrders";
import { Profile } from "./pages/profile";
import { Favorites } from "./pages/Favorites";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminInventory } from "./pages/admin/AdminInventory";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminClients } from "./pages/admin/AdminClients";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminPCBuilder } from "./pages/admin/AdminPCBuilder";
import { AdminImports } from "./pages/admin/AdminImports";
import { AdminReports } from "./pages/admin/AdminReports";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "catalogo", element: <Catalog /> },
      { path: "producto/:id", element: <ProductDetail /> },
      { path: "importaciones", element: <Importaciones /> },
      { path: "login", element: <Auth /> },
      { path: "recuperar-password", element: <ForgotPassword /> },
      { path: "restablecer-password", element: <ResetPassword /> },
      { path: "arma-tu-pc", element: <BuildPC /> },
      { path: "carrito", element: <Cart /> },
      {
        path: "mis-pedidos",
        element: (
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        ),
      },
      {
        path: "perfil",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "favoritos",
        element: (
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireRole="ADMIN">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "productos", element: <AdminProducts /> },
      { path: "inventario", element: <AdminInventory /> },
      { path: "pedidos", element: <AdminOrders /> },
      { path: "clientes", element: <AdminClients /> },
      {
        path: "usuarios",
        element: (
          <ProtectedRoute requireRole="OWNER">
            <AdminUsers />
          </ProtectedRoute>
        ),
      },
      { path: "pc-builder", element: <AdminPCBuilder /> },
      { path: "importaciones", element: <AdminImports /> },
      { path: "reportes", element: <AdminReports /> },
      { path: "configuracion", element: <AdminSettings /> },
    ],
  },
]);
