import { Outlet, useLocation } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ChatBot } from "../components/ChatBot";

export function Root() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';

  return (
    <div className="size-full">
      {!isAuthPage && <Navbar />}
      <Outlet />
      {!isAuthPage && <Footer />}
      {!isAuthPage && <ChatBot />}
    </div>
  );
}