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
    image: "https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=800&q=80",
  },
  {
    slug: "floor-lamps",
    name: "Floor Lamps",
    tagline: "Ambient lighting for every corner",
    image: "https://images.unsplash.com/photo-1507149833265-60c372daea22?w=800&q=80",
  },
  {
    slug: "wall-sconces",
    name: "Wall Sconces",
    tagline: "Warm accents for your walls",
    image: "https://images.unsplash.com/photo-1515260268569-9271009adfdb?w=800&q=80",
  },
];

export const PRODUCTS: Product[] = [
  {
    slug: "luxury-lamp-1",
    name: "Amber Glow Teardrop Chandelier",
    category: "chandeliers",
    price: 1143,
    mrp: 1629,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/1.jpeg"],
    featured: true
  },
  {
    slug: "luxury-lamp-10",
    name: "Rose Gold Spiral Pendant Floor Lamp",
    category: "floor-lamps",
    price: 1283,
    mrp: 1517,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/10.jpeg"],
    featured: true
  },
  {
    slug: "luxury-lamp-11",
    name: "Crystal Cascade Chandelier Wall Sconce",
    category: "wall-sconces",
    price: 638,
    mrp: 751,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/11.jpeg"],
    featured: true
  },
  {
    slug: "luxury-lamp-12",
    name: "Nordic Tripod Floor Lamp Chandelier",
    category: "chandeliers",
    price: 1351,
    mrp: 1620,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/12.jpeg"],
    featured: true
  },
  {
    slug: "luxury-lamp-13",
    name: "Botanical Arch Floor Lamp",
    category: "floor-lamps",
    price: 1639,
    mrp: 2175,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/13.jpeg"],
    featured: true
  },
  {
    slug: "luxury-lamp-14",
    name: "Minimalist Halo Sconce",
    category: "wall-sconces",
    price: 829,
    mrp: 1109,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/14.jpeg"],
    featured: true
  },
  {
    slug: "luxury-lamp-15",
    name: "Vintage Brass Lantern Chandelier",
    category: "chandeliers",
    price: 1974,
    mrp: 2179,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/15.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-16",
    name: "Modern Linear Suspension Floor Lamp",
    category: "floor-lamps",
    price: 786,
    mrp: 1316,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/16.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-17",
    name: "Art Deco Geometric Lamp Wall Sconce",
    category: "wall-sconces",
    price: 1682,
    mrp: 2115,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/17.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-18",
    name: "Industrial Pipe Sconce Chandelier",
    category: "chandeliers",
    price: 1401,
    mrp: 1668,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/18.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-19",
    name: "Amber Glow Teardrop Chandelier 19 Floor Lamp",
    category: "floor-lamps",
    price: 739,
    mrp: 1142,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/19.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-2",
    name: "Rose Gold Spiral Pendant 2 Wall Sconce",
    category: "wall-sconces",
    price: 458,
    mrp: 920,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/2.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-20",
    name: "Crystal Cascade Chandelier 20",
    category: "chandeliers",
    price: 805,
    mrp: 1250,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/20.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-21",
    name: "Nordic Tripod Floor Lamp 21",
    category: "floor-lamps",
    price: 407,
    mrp: 549,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/21.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-22",
    name: "Botanical Arch Floor Lamp 22 Wall Sconce",
    category: "wall-sconces",
    price: 1489,
    mrp: 1879,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/22.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-23",
    name: "Minimalist Halo Sconce 23 Chandelier",
    category: "chandeliers",
    price: 756,
    mrp: 1009,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/23.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-24",
    name: "Vintage Brass Lantern 24 Floor Lamp",
    category: "floor-lamps",
    price: 682,
    mrp: 1242,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/24.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-3",
    name: "Modern Linear Suspension 3 Wall Sconce",
    category: "wall-sconces",
    price: 696,
    mrp: 809,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/3.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-4",
    name: "Art Deco Geometric Lamp 4 Chandelier",
    category: "chandeliers",
    price: 1597,
    mrp: 1884,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/4.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-5",
    name: "Industrial Pipe Sconce 5 Floor Lamp",
    category: "floor-lamps",
    price: 1006,
    mrp: 1178,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/5.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-6",
    name: "Amber Glow Teardrop Chandelier 6 Wall Sconce",
    category: "wall-sconces",
    price: 621,
    mrp: 874,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/6.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-7",
    name: "Rose Gold Spiral Pendant 7",
    category: "chandeliers",
    price: 378,
    mrp: 977,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/7.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-8",
    name: "Crystal Cascade Chandelier 8 Floor Lamp",
    category: "floor-lamps",
    price: 1211,
    mrp: 1757,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/8.jpeg"],
    featured: false
  },
  {
    slug: "luxury-lamp-9",
    name: "Nordic Tripod Floor Lamp 9 Wall Sconce",
    category: "wall-sconces",
    price: 1888,
    mrp: 2154,
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/9.jpeg"],
    featured: false
  }
];

export const getProduct = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug);

export const getCategory = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);

export const productsInCategory = (slug: CategorySlug) =>
  PRODUCTS.filter((p) => p.category === slug);

export const featuredProducts = () => PRODUCTS.filter((p) => p.featured);

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
