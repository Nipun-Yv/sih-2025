import Playground from "../components/Playground";
import ProductCard from "../components/ProductCard";
import ProductList from "../components/ProductList";

export default function ProductPage() {
  return (
    <div className="h-[100vh] w-full bg-gray-100 p-3">
      <div className="flex h-full -gap-1">
        <div className="flex-[1.5] h-full gap-5 flex flex-col p-3">
          <ProductCard/>
          <ProductList/>
          <div>

          </div>
        </div>
        <div className="flex-1 p-3">
          <Playground/>
        </div>
      </div>
    </div>
  );
}

