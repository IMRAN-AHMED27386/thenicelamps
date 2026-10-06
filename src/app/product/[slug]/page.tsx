import Link from "next/link";
import { notFound } from "next/navigation";
import { inr, isOutOfStock } from "@/lib/catalog";
import {
  fetchCatalog,
  fetchSettings,
  fetchReviewsForProduct,
  computeRatingSummary,
  related,
} from "@/lib/db";
import AddToCart from "@/components/AddToCart";
import ProductCard, { categoryNameOf } from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import ReviewSection, { Stars } from "@/components/ReviewSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { products } = await fetchCatalog();
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: "Product – TheNiceLamps" };
  const description = product.description.slice(0, 160);
  return {
    title: `${product.name} – TheNiceLamps`,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      siteName: "TheNiceLamps",
      url: `/product/${product.slug}`,
      title: `${product.name} – TheNiceLamps`,
      description,
      images: [{ url: product.images[0], alt: product.name }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [{ categories, products }, settings, reviews] = await Promise.all([
    fetchCatalog(),
    fetchSettings(),
    fetchReviewsForProduct(slug),
  ]);
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const categoryData = categories.find((c) => c.slug === product.category);
  const catName = categoryNameOf(categories, product.category);
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const rel = related(products, product.category, product.slug);
  const ratingSummary = computeRatingSummary(reviews);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    brand: { "@type": "Brand", name: "TheNiceLamps" },
    ...(ratingSummary.total > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: ratingSummary.average.toFixed(1),
            bestRating: "5",
            ratingCount: ratingSummary.total,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: `https://thenicelamps.com/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: isOutOfStock(product)
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <main className="page-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pdp-wrap">
        <p className="crumbs">
          <Link href="/shop">Shop</Link>
          <span> / </span>
          <Link href={`/shop?cat=${product.category}`}>{catName}</Link>
          <span> / </span>
          {product.name}
        </p>

        <div className="pdp">
          <ProductGallery
            images={product.images}
            video={product.video}
            name={product.name}
          />

          <div className="pdp-info">
            <p className="prod-cat">{catName}</p>
            <h1 className="pdp-name">{product.name}</h1>

            {/* ── Rating + Sold badges ── */}
            <div className="pdp-badges">
              {ratingSummary.total > 0 && (
                <a href="#reviews" className="pdp-rating-badge">
                  <Stars rating={ratingSummary.average} size="sm" />
                  <span className="pdp-rating-text">
                    {ratingSummary.average.toFixed(1)} ({ratingSummary.total})
                  </span>
                </a>
              )}
              {(product.soldCount ?? 0) > 0 && (
                <span className="pdp-sold-badge">
                  🔥 {product.soldCount!.toLocaleString("en-IN")} sold
                </span>
              )}
            </div>

            <p className="pdp-price">
              {inr(product.price)} <s>{inr(product.mrp)}</s>
              {off > 0 && <span className="pdp-off">{off}% off</span>}
            </p>
            <p className="pdp-desc">{product.description}</p>
            <ul className="pdp-meta">
              <li>
                <strong>Fabric:</strong> {product.fabric}
              </li>
              <li>
                <strong>Delivery:</strong> {settings.deliveryText}
              </li>
              <li>
                <strong>Returns:</strong> {settings.returnsText}
              </li>
            </ul>

            <AddToCart product={product} sizeGuideImg={categoryData?.sizeGuide} />
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <ReviewSection
          productSlug={product.slug}
          initialReviews={reviews}
          initialSummary={ratingSummary}
        />

        {rel.length > 0 && (
          <div className="related">
            <h2 className="s-title rv">
              You May Also <em>Love</em>
            </h2>
            <div className="s-divider rv" />
            <div className="prod-grid">
              {rel.map((p) => (
                <ProductCard
                  key={p.slug}
                  product={p}
                  categoryName={categoryNameOf(categories, p.category)}
                  averageRating={p.averageRating}
                  reviewCount={p.reviewCount}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
