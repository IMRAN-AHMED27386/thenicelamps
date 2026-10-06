import Link from "next/link";
import { Product, Category, inr, isOutOfStock } from "@/lib/catalog";

export default function ProductCard({
  product,
  categoryName,
  averageRating,
  reviewCount,
}: {
  product: Product;
  categoryName?: string;
  averageRating?: number;
  reviewCount?: number;
}) {
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const outOfStock = isOutOfStock(product);
  const sold = product.soldCount ?? 0;

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

        {/* ── Rating + Sold row ── */}
        {((averageRating && reviewCount) || sold > 0) && (
          <div className="prod-stats">
            {averageRating && reviewCount ? (
              <span className="prod-rating">
                <span className="prod-star">★</span>
                {averageRating.toFixed(1)}
                <span className="prod-review-count">({reviewCount})</span>
              </span>
            ) : null}
            {sold > 0 && (
              <span className="prod-sold">
                {sold.toLocaleString("en-IN")} sold
              </span>
            )}
          </div>
        )}

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
