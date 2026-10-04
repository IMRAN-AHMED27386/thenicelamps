import Link from "next/link";
import { notFound } from "next/navigation";
import { inr, isOutOfStock } from "@/lib/catalog";
import { fetchCatalog, fetchSettings, related } from "@/lib/db";
import AddToCart from "@/components/AddToCart";
import ProductCard, { categoryNameOf } from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";

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
  const { categories, products } = await fetchCatalog();
  const settings = await fetchSettings();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const categoryData = categories.find((c) => c.slug === product.category);

  const catName = categoryNameOf(categories, product.category);
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const rel = related(products, product.category, product.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    brand: { "@type": "Brand", name: "TheNiceLamps" },
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

        {rel.length > 0 && (
          <div className="related">
            <h2 className="s-title rv">
              You May Also <em>Love</em>
            </h2>
            <div className="s-divider rv"></div>
            <div className="prod-grid">
              {rel.map((p) => (
                <ProductCard
                  key={p.slug}
                  product={p}
                  categoryName={categoryNameOf(categories, p.category)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
