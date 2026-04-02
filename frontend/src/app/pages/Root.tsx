import { Outlet } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export function Root() {
  return (
    <div className="size-full">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
