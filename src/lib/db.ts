import {
  Category,
  CategorySlug,
  Product,
  CATEGORIES as FALLBACK_CATEGORIES,
  PRODUCTS as FALLBACK_PRODUCTS,
} from "./catalog";

const PROJECT = "thenicelamps-store";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

type FsValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  arrayValue?: { values?: FsValue[] };
  mapValue?: { fields?: Record<string, FsValue> };
};

type FsDoc = { name: string; fields?: Record<string, FsValue> };

function decode(v: FsValue): unknown {
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.arrayValue !== undefined)
    return (v.arrayValue.values || []).map(decode);
  if (v.mapValue !== undefined)
    return Object.fromEntries(
      Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, decode(x)])
    );
  return null;
}

function docToObj(doc: FsDoc): Record<string, unknown> {
  const slug = doc.name.split("/").pop() as string;
  const fields = Object.fromEntries(
    Object.entries(doc.fields || {}).map(([k, v]) => [k, decode(v)])
  );
  return { slug, ...fields };
}

export type Catalog = { categories: Category[]; products: Product[] };

export type StoreSettings = {
  deliveryText: string;
  returnsText: string;
};

export async function fetchSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch(`${BASE}/settings/store`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error();
    const json = await res.json();
    return docToObj(json) as unknown as StoreSettings;
  } catch {
    return {
      deliveryText: "3–7 days across India",
      returnsText: "Easy 7-day returns",
    };
  }
}

export async function fetchCatalog(): Promise<Catalog> {
  try {
    const [cRes, pRes, rRes, oRes] = await Promise.all([
      fetch(`${BASE}/categories?pageSize=50`, { next: { revalidate: 60 } }),
      fetch(`${BASE}/products?pageSize=300`, { next: { revalidate: 60 } }),
      fetch(`${BASE}/reviews?pageSize=1000`, { next: { revalidate: 60 } }),
      fetch(`${BASE}/orders?pageSize=1000`, { next: { revalidate: 60 } }),
    ]);
    if (!cRes.ok || !pRes.ok) throw new Error(`${cRes.status}/${pRes.status}`);
    const cJson = await cRes.json();
    const pJson = await pRes.json();
    let rJson = { documents: [] };
    if (rRes.ok) {
      rJson = await rRes.json();
    }
    let oJson = { documents: [] };
    if (oRes.ok) {
      oJson = await oRes.json();
    }

    const categories = ((cJson.documents || []) as FsDoc[])
      .map(docToObj)
      .sort(
        (a, b) => ((a.order as number) ?? 0) - ((b.order as number) ?? 0)
      ) as unknown as Category[];

    const products = ((pJson.documents || []) as FsDoc[])
      .map(docToObj)
      .sort(
        (a, b) =>
          ((a.sortOrder as number) ?? 0) - ((b.sortOrder as number) ?? 0)
      ) as unknown as Product[];
      
    // Compute review stats
    const reviews = ((rJson.documents || []) as FsDoc[]).map(docToObj) as unknown as ReviewData[];
    const stats: Record<string, { total: number; sum: number }> = {};
    for (const r of reviews) {
      if (!stats[r.productSlug]) stats[r.productSlug] = { total: 0, sum: 0 };
      stats[r.productSlug].total++;
      stats[r.productSlug].sum += r.rating;
    }

    // Compute dynamic sold counts from orders
    const orders = ((oJson.documents || []) as FsDoc[]).map(docToObj) as unknown as {
      status?: string;
      items?: { slug?: string; product?: { slug?: string }; qty?: number; quantity?: number }[];
    }[];
    const orderSoldMap: Record<string, number> = {};
    for (const o of orders) {
      if (o.status === "cancelled") continue;
      if (Array.isArray(o.items)) {
        for (const it of o.items) {
          const s = it.slug || it.product?.slug;
          if (s) {
            const q = it.qty || it.quantity || 1;
            orderSoldMap[s] = (orderSoldMap[s] || 0) + q;
          }
        }
      }
    }

    for (const p of products) {
      const s = stats[p.slug];
      if (s && s.total > 0) {
        p.reviewCount = s.total;
        p.averageRating = s.sum / s.total;
      }
      const orderSold = orderSoldMap[p.slug] || 0;
      p.soldCount = Math.max(p.soldCount || 0, orderSold);
    }

    if (categories.length === 0 || products.length === 0)
      throw new Error("empty catalog");

    return { categories, products };
  } catch {
    return { categories: FALLBACK_CATEGORIES, products: FALLBACK_PRODUCTS };
  }
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  const { products } = await fetchCatalog();
  return products.find((p) => p.slug === slug) ?? null;
}

export function related(
  products: Product[],
  category: CategorySlug,
  excludeSlug: string,
  limit = 3
): Product[] {
  return products
    .filter((p) => p.category === category && p.slug !== excludeSlug)
    .slice(0, limit);
}

/* ── Reviews (server-side REST fetch) ── */

export type ReviewData = {
  id: string;
  productSlug: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verified: boolean;
  imageUrls?: string[];
};

export type RatingSummaryData = {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export async function fetchReviewsForProduct(
  slug: string
): Promise<ReviewData[]> {
  try {
    const body = {
      structuredQuery: {
        from: [{ collectionId: "reviews" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "productSlug" },
            op: "EQUAL",
            value: { stringValue: slug },
          },
        },
        limit: 100,
      },
    };
    const res = await fetch(`${BASE}:runQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const json = await res.json();
    // Firestore runQuery returns [{document: ...}, ...] — skip empty results
    return (json as { document?: FsDoc }[])
      .filter((r) => r.document)
      .map((r) => docToObj(r.document!) as unknown as ReviewData)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return [];
  }
}

export function computeRatingSummary(
  reviews: ReviewData[]
): RatingSummaryData {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  };
  let sum = 0;
  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as
      | 1 | 2 | 3 | 4 | 5;
    distribution[star]++;
    sum += star;
  }
  return {
    average: reviews.length > 0 ? sum / reviews.length : 0,
    total: reviews.length,
    distribution,
  };
}

