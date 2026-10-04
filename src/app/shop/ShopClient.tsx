"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Category, Product } from "@/lib/catalog";
import ProductCard, { categoryNameOf } from "@/components/ProductCard";

export default function ShopClient({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const cat = params.get("cat");

  const active = categories.find((c) => c.slug === cat)?.slug ?? null;
  const shown = active
    ? products.filter((p) => p.category === active)
    : products;

  const setCat = (slug: string | null) => {
    router.push(slug ? `/shop?cat=${slug}` : "/shop", { scroll: false });
  };

  return (
    <div className="shop-wrap">
      <div className="page-head">
        <p className="s-eyebrow">The TheNiceLamps Edit</p>
        <h1 className="s-title">
          Shop{" "}
          <em>{categories.find((c) => c.slug === active)?.name ?? "All"}</em>
        </h1>
        <div className="s-divider"></div>
      </div>

      <div className="filter-chips">
        <button
          className={`chip ${!active ? "active" : ""}`}
          onClick={() => setCat(null)}
        >
          All ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            className={`chip ${active === c.slug ? "active" : ""}`}
            onClick={() => setCat(c.slug)}
          >
            {c.name} ({products.filter((p) => p.category === c.slug).length})
          </button>
        ))}
      </div>

      <div className="prod-grid">
        {shown.map((p) => (
          <ProductCard
            key={p.slug}
            product={p}
            categoryName={categoryNameOf(categories, p.category)}
          />
        ))}
      </div>
    </div>
  );
}
