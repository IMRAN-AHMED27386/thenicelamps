export type CategorySlug = "chandeliers" | "floor-lamps" | "wall-sconces";

export type Category = {
  slug: CategorySlug;
  name: string;
  tagline: string;
  image: string;
  sizeGuide?: string;
};

export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  mrp: number;
  fabric: string; // repurposing for Material
  description: string;
  sizes: string[]; // repurposing for variations or just keeping empty
  images: string[];
  video?: string;
  featured?: boolean;
  inStock?: boolean;
  stockQty?: number | null;
  sortOrder?: number;
};

export function isOutOfStock(p: Product): boolean {
  return (
    p.inStock === false || (typeof p.stockQty === "number" && p.stockQty <= 0)
  );
}

export const SIZES = ["Standard"];

export const CATEGORIES: Category[] = [
  {
    slug: "chandeliers",
    name: "Chandeliers",
    tagline: "Elegant centerpieces for your ceiling",
    image: "/product-2.jpeg",
  },
  {
    slug: "floor-lamps",
    name: "Floor Lamps",
    tagline: "Ambient lighting for every corner",
    image: "/product-4.jpeg",
  },
  {
    slug: "wall-sconces",
    name: "Wall Sconces",
    tagline: "Warm accents for your walls",
    image: "/product-5.jpeg",
  },
];

export const PRODUCTS: Product[] = [
  {
    slug: "crystal-cascade-chandelier",
    name: "Crystal Cascade Chandelier",
    category: "chandeliers",
    price: 15999, mrp: 21999,
    fabric: "Premium Crystal & Gold Finish",
    description: "A breathtaking crystal chandelier that brings royal elegance to your living or dining room. Thousands of precision-cut crystals refract light beautifully.",
    sizes: SIZES,
    images: ["/product-1.jpeg"],
    featured: true,
  },
  {
    slug: "amber-glow-teardrop-chandelier",
    name: "Amber Glow Teardrop Chandelier",
    category: "chandeliers",
    price: 24999, mrp: 32999,
    fabric: "Amber Glass & Brass",
    description: "A stunning cascade of amber glass teardrops. This modern chandelier creates a warm, inviting atmosphere and serves as a spectacular focal point.",
    sizes: SIZES,
    images: ["/product-2.jpeg"],
    featured: true,
  },
  {
    slug: "rose-gold-spiral-pendant",
    name: "Rose Gold Spiral Pendant",
    category: "chandeliers",
    price: 18499, mrp: 25000,
    fabric: "Rose Gold Plated Aluminum & LED",
    description: "A contemporary LED spiral pendant light in a luxurious rose gold finish. Perfect for high ceilings and modern minimalist spaces.",
    sizes: SIZES,
    images: ["/product-3.jpeg"],
    featured: true,
  },
  {
    slug: "nordic-tripod-floor-lamp",
    name: "Nordic Tripod Floor Lamp",
    category: "floor-lamps",
    price: 8999, mrp: 12499,
    fabric: "Solid Wood & Linen Shade",
    description: "A classic Scandinavian-inspired tripod floor lamp. Features a warm linen shade and solid wood legs, perfect for cozy reading corners.",
    sizes: SIZES,
    images: ["/product-4.jpeg"],
    featured: true,
  },
  {
    slug: "botanical-arch-floor-lamp",
    name: "Botanical Arch Floor Lamp",
    category: "floor-lamps",
    price: 11299, mrp: 15999,
    fabric: "Matte Black Metal & Glass Globe",
    description: "An elegant arching floor lamp with a clear glass globe. Provides excellent overhead reading light without requiring ceiling installation.",
    sizes: SIZES,
    images: ["/product-5.jpeg"],
  },
];

export const getProduct = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug);

export const getCategory = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);

export const productsInCategory = (slug: CategorySlug) =>
  PRODUCTS.filter((p) => p.category === slug);

export const featuredProducts = () => PRODUCTS.filter((p) => p.featured);

export const inr = (n: number) => \`₹\${n.toLocaleString("en-IN")}\`;
