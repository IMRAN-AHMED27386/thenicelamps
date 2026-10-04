import Link from "next/link";
import { Product, Category, inr, isOutOfStock } from "@/lib/catalog";

export default function ProductCard({
  product,
  categoryName,
}: {
  product: Product;
  categoryName?: string;
}) {
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const outOfStock = isOutOfStock(product);

  return (
    <Link href={`/product/${product.slug}`} className="prod-card rv">
      <div className="prod-img">
        <img src={product.images[0]} alt={product.name} loading="lazy" />
        {outOfStock ? (
          <span className="prod-off" style={{ background: "#555" }}>
            Out of Stock
          </span>
        ) : (
          off > 0 && <span className="prod-off">{off}% off</span>
        )}
        <span className="prod-view">View Details</span>
      </div>
      <div className="prod-info">
        <p className="prod-cat">{categoryName ?? product.category}</p>
        <h3 className="prod-name">{product.name}</h3>
        <p className="prod-price">
          {inr(product.price)} <s>{inr(product.mrp)}</s>
        </p>
      </div>
    </Link>
  );
}

export function categoryNameOf(
  categories: Category[],
  slug: string
): string | undefined {
  return categories.find((c) => c.slug === slug)?.name;
}
