import { useLocation } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ChatBot } from "../components/ChatBot";
import { PageTransition } from "../components/PageTransition";

export function Root() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';
  // Dentro de /admin/* mantenemos un scope constante para que AdminLayout
  // (sidebar + header) no se re-anime en cada cambio de sub-ruta —
  // AdminLayout aplica su propia transición a la página interna.
  const isAdminRoute = location.pathname.startsWith('/admin');
  const scopeKey = isAdminRoute ? 'admin' : location.pathname;

  return (
    <div className="size-full">
      {!isAuthPage && <Navbar />}
      <PageTransition scopeKey={scopeKey} />
      {!isAuthPage && <Footer />}
      {!isAuthPage && <ChatBot />}
    </div>
  );
}
