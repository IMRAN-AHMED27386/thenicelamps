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
    const [cRes, pRes] = await Promise.all([
      fetch(`${BASE}/categories?pageSize=50`, { next: { revalidate: 60 } }),
      fetch(`${BASE}/products?pageSize=300`, { next: { revalidate: 60 } }),
    ]);
    if (!cRes.ok || !pRes.ok) throw new Error(`${cRes.status}/${pRes.status}`);
    const cJson = await cRes.json();
    const pJson = await pRes.json();

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
