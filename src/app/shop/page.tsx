import { Suspense } from "react";
import ShopClient from "./ShopClient";
import { fetchCatalog } from "@/lib/db";

export const metadata = {
  title: "Shop – TheNiceLamps",
  description:
    "Shop Pakistani suits, co-ord sets and Anarkali frocks at TheNiceLamps.",
};

export default async function ShopPage() {
  const { categories, products } = await fetchCatalog();

  return (
    <main className="page-main">
      <Suspense fallback={null}>
        <ShopClient categories={categories} products={products} />
      </Suspense>
    </main>
  );
}
