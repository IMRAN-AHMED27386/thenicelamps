const fs = require('fs');
const path = require('path');

const tsxPath = path.join(__dirname, 'src/app/admin/page.tsx');
let tsx = fs.readFileSync(tsxPath, 'utf8');

// 1. Add search state to Dashboard
tsx = tsx.replace(
  'const [coupons, setCoupons] = useState<Coupon[]>([]);',
  'const [coupons, setCoupons] = useState<Coupon[]>([]);\n  const [searchQuery, setSearchQuery] = useState("");'
);

// 2. Add derived variables for filtered arrays before `return`
const derivedSearchStr = `
  const searchLower = searchQuery.toLowerCase();
  
  const visibleCategories = categories.filter(c => 
    !searchQuery || 
    c.name.toLowerCase().includes(searchLower) || 
    (c.tagline && c.tagline.toLowerCase().includes(searchLower))
  );

  const visibleProducts = products.filter(p => 
    !searchQuery || 
    p.name.toLowerCase().includes(searchLower) || 
    p.slug.toLowerCase().includes(searchLower)
  );

  return (
`;
tsx = tsx.replace('  return (\n    <div className="admin-layout">', derivedSearchStr + '    <div className="admin-layout">');

// 3. Connect the top search bar
tsx = tsx.replace(
  '<input type="text" placeholder="Search products, categories..." className="admin-search-input" />',
  '<input type="text" placeholder="Search products, categories..." className="admin-search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />'
);

// 4. Connect the small search bars in Categories and Products, and switch arrays to visible*
// Categories
tsx = tsx.replace(
  '<input type="text" placeholder="Search categories..." className="admin-search-input sm" />',
  '<input type="text" placeholder="Search categories..." className="admin-search-input sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />'
);
tsx = tsx.replace(
  '{categories.map((c) => (',
  '{visibleCategories.map((c) => ('
);

// Products
tsx = tsx.replace(
  '<input type="text" placeholder="Search products..." className="admin-search-input sm" />',
  '<input type="text" placeholder="Search products..." className="admin-search-input sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />'
);
tsx = tsx.replace(
  '{products.map((p) => (',
  '{visibleProducts.map((p) => ('
);

fs.writeFileSync(tsxPath, tsx);
console.log("Search functionality implemented!");
