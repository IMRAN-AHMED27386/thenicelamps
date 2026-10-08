const fs = require('fs');
const path = require('path');

const tsxPath = path.join(__dirname, 'src/app/admin/page.tsx');
let tsx = fs.readFileSync(tsxPath, 'utf8');

// 1. Add "overview" and "categories" to AdminPermissions type if needed
// Actually we don't need it in AdminPermissions if everyone can see it or if we just base it on "products" permission.
// Let's just allow tab to be "overview" or "categories"

// Add LayoutIcon and FolderTree to lucide-react imports
tsx = tsx.replace(
  'import { Package, ShoppingCart, MessageSquare, Star, Tag, Settings, LogOut, Search, User as UserIcon } from "lucide-react";',
  'import { Package, ShoppingCart, MessageSquare, Star, Tag, Settings, LogOut, Search, User as UserIcon, LayoutDashboard, FolderTree } from "lucide-react";'
);

// 2. Add Overview tab and Categories tab to the sidebar
// We find the nav items and insert overview at the top, and categories above products.
const navStr = `
        <nav className="admin-nav">
          <button className={\`admin-nav-item \${tab === 'overview' ? 'active' : ''}\`} onClick={() => setTab("overview")}>
            <LayoutDashboard size={18} /> <span>Overview</span>
          </button>
          {permissions.products && (
            <>
              <button className={\`admin-nav-item \${tab === 'categories' ? 'active' : ''}\`} onClick={() => setTab("categories")}>
                <FolderTree size={18} /> <span>Categories</span>
              </button>
              <button className={\`admin-nav-item \${tab === 'products' ? 'active' : ''}\`} onClick={() => setTab("products")}>
                <Package size={18} /> <span>Products</span>
              </button>
            </>
          )}
`;
tsx = tsx.replace(/<nav className="admin-nav">\s*\{permissions\.products && \(\s*<button className=\{`admin-nav-item \$\{tab === 'products' \? 'active' : ''\}`\} onClick=\{\(\) => setTab\("products"\)\}>\s*<Package size=\{18\} \/> <span>Products<\/span>\s*<\/button>\s*\)}/, navStr);


// 3. Update getInitialTab to return "overview"
tsx = tsx.replace(
  /const getInitialTab = \(\): keyof AdminPermissions => \{\s*if \(permissions.products\) return "products";/,
  'const getInitialTab = (): string => {\n    if (permissions.products) return "overview";'
);

// We need to type the state as string instead of keyof AdminPermissions, or add it to a custom type
tsx = tsx.replace(
  /const \[tab, setTab\] = useState<keyof AdminPermissions>\(getInitialTab\(\)\);/,
  'const [tab, setTab] = useState<string>(getInitialTab());'
);


// 4. Update the content title/subtitle logic
const titleLogicStr = `{tab === "overview"
                ? "Overview"
                : tab === "categories"
                  ? "Categories"
                  : tab === "products"`;
tsx = tsx.replace(/\{tab === "products"/, titleLogicStr);

const subtitleLogicStr = `{tab === "overview" && "Dashboard summary and reports"}
              {tab === "categories" && "Manage your product categories"}
              {tab === "products" && "Manage your products and inventory"}`;
tsx = tsx.replace(/\{tab === "products" && "Manage your products, categories and inventory"\}/, subtitleLogicStr);


// 5. Move summary cards from "products" to "overview"
tsx = tsx.replace(/\{tab === "products" && \(\s*<div className="admin-summary-cards">/, '{tab === "overview" && (\n            <div className="admin-summary-cards">');


// 6. Split Products and Categories panels
// Originally they were rendered together when tab === "products"
const oldProductsPanel = `<div className="admin-products-layout">
              <div className="admin-panel-card">`;

// We will change the condition from `} else if (loading) {` to `} else if (tab === "categories") {`
// Actually let's use string replacement to be precise

// Change the fallback `) : loading ?` to handle categories
// We can replace the whole layout
// Let's find: `) : loading ? (\n            <p className="admin-loading">Loading products…</p>\n          ) : (\n            <div className="admin-products-layout">\n              <div className="admin-panel-card">`
const searchStr = `          ) : tab === "coupons" ? (
            <CouponsPanel coupons={coupons} />
          ) : loading ? (
            <p className="admin-loading">Loading products…</p>
          ) : (
            <div className="admin-products-layout">
              <div className="admin-panel-card">
                <div className="admin-panel-header">`;

const replaceStr = `          ) : tab === "coupons" ? (
            <CouponsPanel coupons={coupons} />
          ) : tab === "categories" ? (
            <div className="admin-panel-card" style={{ maxWidth: 800 }}>
              <div className="admin-panel-header">
                <h3>All Categories</h3>
                <button className="btn-gold admin-btn-sm" onClick={() => setEditing("new")}>
                  + ADD CATEGORY
                </button>
              </div>
              <CategoriesEditor categories={categories} onSaved={loadStaticData} />
            </div>
          ) : tab === "overview" ? (
            <div className="admin-overview-content">
              {/* Optional: Add recent orders or more stats here later */}
            </div>
          ) : loading ? (
            <p className="admin-loading">Loading products…</p>
          ) : (
            <div className="admin-panel-card">
              <div className="admin-panel-header">`;

tsx = tsx.replace(searchStr, replaceStr);

// Now remove the right column (Categories Editor) from the old products layout
// It was:
/*
              <div className="admin-panel-card right-col">
                <div className="admin-panel-header">
                  <h3>Categories</h3>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                  <button className="btn-gold admin-btn-sm" onClick={() => setEditing("new")}>
                    + ADD CATEGORY
                  </button>
                </div>
                <CategoriesEditor categories={categories} onSaved={loadStaticData} />
              </div>
            </div>
*/
const removeRegex = /<\/div>\s*<\/div>\s*<div className="admin-panel-card right-col">[\s\S]*?<CategoriesEditor categories=\{categories\} onSaved=\{loadStaticData\} \/>\s*<\/div>\s*<\/div>/;
tsx = tsx.replace(removeRegex, '</div>\n              </div>');


fs.writeFileSync(tsxPath, tsx);
console.log("AdminPage updated!");
