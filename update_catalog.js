const fs = require('fs');
const path = require('path');

const srcDir = '/Users/imranahmed/Documents/IMRAN/Maldives Business/Own Platform Selling Soft and Apps/thenicelamps/IMAGES/New';
const destDir = '/Users/imranahmed/Documents/IMRAN/Maldives Business/Own Platform Selling Soft and Apps/thenicelamps/public/images/new';
const catalogPath = '/Users/imranahmed/Documents/IMRAN/Maldives Business/Own Platform Selling Soft and Apps/thenicelamps/src/lib/catalog.ts';

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'));

files.forEach(f => {
  fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
});

const newProducts = files.filter(f => f.match(/^\d+\.jpeg$/)).map((f, i) => {
  const price = Math.floor(Math.random() * (2000 - 300 + 1)) + 300;
  const mrp = price + Math.floor(Math.random() * 500) + 100;
  const num = parseInt(f.split('.')[0]);
  
  const cats = ["chandeliers", "floor-lamps", "wall-sconces"];
  const cat = cats[i % cats.length];
  
  const names = [
    "Amber Glow Teardrop Chandelier",
    "Rose Gold Spiral Pendant",
    "Crystal Cascade Chandelier",
    "Nordic Tripod Floor Lamp",
    "Botanical Arch Floor Lamp",
    "Minimalist Halo Sconce",
    "Vintage Brass Lantern",
    "Modern Linear Suspension",
    "Art Deco Geometric Lamp",
    "Industrial Pipe Sconce"
  ];
  
  let name = names[i % names.length] + (i >= names.length ? ` ${num}` : "");
  if (cat === "chandeliers" && !name.includes("Chandelier") && !name.includes("Pendant") && !name.includes("Suspension")) name += " Chandelier";
  if (cat === "floor-lamps" && !name.includes("Lamp")) name += " Floor Lamp";
  if (cat === "wall-sconces" && !name.includes("Sconce") && !name.includes("Lantern")) name += " Wall Sconce";
  
  return `{
    slug: "luxury-lamp-${num}",
    name: "${name}",
    category: "${cat}",
    price: ${price},
    mrp: ${mrp},
    fabric: "Premium Material",
    description: "An elegant addition to your luxury space. Features premium build quality and stunning illumination.",
    sizes: SIZES,
    images: ["/images/new/${f}"],
    featured: ${i < 6 ? 'true' : 'false'}
  }`;
});

let catalogStr = fs.readFileSync(catalogPath, 'utf8');
const productsMatch = catalogStr.match(/export const PRODUCTS: Product\[\] = \[([\s\S]*?)\];/);
if (productsMatch) {
  const newArrayStr = `export const PRODUCTS: Product[] = [\n  ${newProducts.join(',\n  ')}\n];`;
  catalogStr = catalogStr.replace(productsMatch[0], newArrayStr);
  fs.writeFileSync(catalogPath, catalogStr);
  console.log("Catalog updated with " + newProducts.length + " products");
} else {
  console.error("Could not find PRODUCTS array");
}
