import { Header } from "../components/Header";
import { Categories } from "../components/Categories";
import { PCBuilder } from "../components/PCBuilder";
import { FeaturedProducts } from "../components/FeaturedProducts";

export function Home() {
  return (
    <>
      <Header />
      <Categories />
      <PCBuilder />
      <FeaturedProducts />
    </>
  );
}
