import { Outlet, useLocation } from "react-router";

interface PageTransitionProps {
  /**
   * Si está presente, fuerza la clave de re-montaje. Útil para evitar que
   * un layout padre (ej. AdminLayout con sidebar) se anime también cuando
   * solo cambia la sub-ruta. Sin este prop, se re-monta en cada cambio de
   * pathname.
   */
  scopeKey?: string;
}

export function PageTransition({ scopeKey }: PageTransitionProps) {
  const location = useLocation();
  const key = scopeKey ?? location.pathname;

  return (
    <div key={key} className="animate-pageEnter">
      <Outlet />
    </div>
  );
}
