import type { MetadataRoute } from "next";
import { fetchCatalog } from "@/lib/db";

const BASE = "https://thenicelamps.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { categories, products } = await fetchCatalog();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/shop`, changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({
      url: `${BASE}/shop?cat=${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/product/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
