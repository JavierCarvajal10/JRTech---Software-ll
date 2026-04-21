import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
//import { Auth } from "./pages/Auth";
//import { ProductDetail } from "./pages/ProductDetail";
//import { Importaciones } from "./pages/Importaciones";
import { BuildPC } from "./pages/BuildPC";
import { Cart } from "./pages/Cart";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "catalogo", element: <Catalog /> },
//      { path: "producto/:id", element: <ProductDetail /> },
 //     { path: "importaciones", element: <Importaciones /> },
  //    { path: "login", element: <Auth /> },
      { path: "arma-tu-pc", element: <BuildPC /> },
      { path: "carrito", element: <Cart /> },
    ],
  },
]);
