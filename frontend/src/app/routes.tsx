import { createBrowserRouter } from "react-router-dom";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
import { Auth } from "./pages/Auth";
import { ProductDetail } from "./pages/ProductDetail";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "catalogo", element: <Catalog /> },
      { path: "producto/:id", element: <ProductDetail /> },
      { path: "login", element: <Auth /> },
    ],
  },
]);
