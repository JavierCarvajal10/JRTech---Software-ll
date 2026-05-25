import { useState, useEffect } from 'react';
import { Header } from "../components/Header";
import { Categories } from "../components/Categories";
import { PCBuilder } from "../components/PCBuilder";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { useAuth } from '../context/AuthContext';

export function Home() {
  const { user, justLoggedIn, clearJustLoggedIn } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (justLoggedIn && user) {
      setShowWelcome(true);


      const timer = setTimeout(() => {
        setShowWelcome(false);
        clearJustLoggedIn();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [justLoggedIn, user, clearJustLoggedIn]);

  return (
    <>
      {/* Welcome Message */}
      {showWelcome && user && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slideDown w-[calc(100%-2rem)] sm:w-auto max-w-md px-4 sm:px-0">
          <div className="bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white px-5 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-2xl border-2 border-white">
            <p className="text-sm sm:text-lg font-semibold text-center">
              Hola, {user.firstName} ¿Qué producto estás buscando hoy?
            </p>
          </div>
        </div>
      )}

      <Header />
      <Categories />
      <PCBuilder />
      <FeaturedProducts />
    </>
  );
}
