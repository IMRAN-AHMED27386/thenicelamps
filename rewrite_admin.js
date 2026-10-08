const fs = require('fs');
const path = require('path');

const tsxPath = path.join(__dirname, 'src/app/admin/page.tsx');
let tsx = fs.readFileSync(tsxPath, 'utf8');

if (!tsx.includes('lucide-react')) {
  tsx = tsx.replace(
    'import { useState, useEffect, FormEvent } from "react";',
    'import { useState, useEffect, FormEvent } from "react";\nimport { Package, ShoppingCart, MessageSquare, Star, Tag, Settings, LogOut, Search, User as UserIcon } from "lucide-react";'
  );
}

const newMainLayout = `
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="admin-logo-text">THENICELAMPS</span>
          <span className="admin-logo-sub">ADMIN</span>
        </div>
        
        <nav className="admin-nav">
          {permissions.products && (
            <button className={\`admin-nav-item \${tab === 'products' ? 'active' : ''}\`} onClick={() => setTab("products")}>
              <Package size={18} /> <span>Products</span>
            </button>
          )}
          {permissions.orders && (
            <button className={\`admin-nav-item \${tab === 'orders' ? 'active' : ''}\`} onClick={() => setTab("orders")}>
              <ShoppingCart size={18} /> <span>Orders</span>
              {orders.length > 0 && <span className="admin-badge">{orders.length}</span>}
            </button>
          )}
          {permissions.requests && (
            <button className={\`admin-nav-item \${tab === 'requests' ? 'active' : ''}\`} onClick={() => setTab("requests")}>
              <MessageSquare size={18} /> <span>Requests</span>
              {requests.length > 0 && <span className="admin-badge">{requests.length}</span>}
            </button>
          )}
          {permissions.reviews && (
            <button className={\`admin-nav-item \${tab === 'reviews' ? 'active' : ''}\`} onClick={() => setTab("reviews")}>
              <Star size={18} /> <span>Reviews</span>
              {reviews.length > 0 && <span className="admin-badge">{reviews.length}</span>}
            </button>
          )}
          {permissions.coupons && (
            <button className={\`admin-nav-item \${tab === 'coupons' ? 'active' : ''}\`} onClick={() => setTab("coupons")}>
              <Tag size={18} /> <span>Coupons</span>
              {coupons.length > 0 && <span className="admin-badge">{coupons.length}</span>}
            </button>
          )}
          {permissions.settings && (
            <button className={\`admin-nav-item \${tab === 'settings' ? 'active' : ''}\`} onClick={() => setTab("settings")}>
              <Settings size={18} /> <span>Settings</span>
            </button>
          )}
        </nav>

        <button className="admin-nav-item admin-signout" onClick={onSignOut}>
          <LogOut size={18} /> <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-search-wrap">
            <Search size={18} />
            <input type="text" placeholder="Search products, categories..." className="admin-search-input" />
          </div>
          <div className="admin-top-actions">
            {tab === "products" && (
              <button className="btn-gold admin-btn-sm" onClick={() => setEditing("new")}>
                + ADD PRODUCT
              </button>
            )}
            <div className="admin-avatar">
              <UserIcon size={20} />
            </div>
          </div>
        </header>

        <div className="admin-content-scroll">
          <div className="admin-content-header">
            <h1 className="admin-title">
              {tab === "products"
                ? "Products"
                : tab === "orders"
                  ? "Orders"
                  : tab === "requests"
                    ? "Stock Requests"
                    : tab === "reviews"
                      ? "Reviews"
                      : tab === "coupons"
                        ? "Coupons"
                        : tab === "settings"
                          ? "Settings"
                          : "Admins"}
            </h1>
            <p className="admin-subtitle">
              {tab === "products" && "Manage your products, categories and inventory"}
              {tab === "orders" && "View and manage customer orders"}
              {tab === "settings" && "Configure store settings"}
            </p>
          </div>

          {tab === "products" && (
            <div className="admin-summary-cards">
              <div className="admin-summary-card">
                <div className="summary-icon"><Package size={24} /></div>
                <div>
                  <div className="summary-val">{products.length}</div>
                  <div className="summary-lbl">Total Products</div>
                </div>
              </div>
              <div className="admin-summary-card">
                <div className="summary-icon"><ShoppingCart size={24} /></div>
                <div>
                  <div className="summary-val">{orders.length}</div>
                  <div className="summary-lbl">Total Orders</div>
                </div>
              </div>
              <div className="admin-summary-card">
                <div className="summary-icon"><MessageSquare size={24} /></div>
                <div>
                  <div className="summary-val">{requests.length}</div>
                  <div className="summary-lbl">Product Requests</div>
                </div>
              </div>
              <div className="admin-summary-card">
                <div className="summary-icon"><Star size={24} /></div>
                <div>
                  <div className="summary-val">{reviews.length}</div>
                  <div className="summary-lbl">Total Reviews</div>
                </div>
              </div>
            </div>
          )}

          {tab === "settings" ? (
            <SettingsPanel />
          ) : tab === "admins" ? (
            <AdminsPanel currentUser={currentUser} />
          ) : tab === "reviews" ? (
            loading ? (
              <p className="admin-loading">Loading reviews…</p>
            ) : (
              <AdminReviewsPanel reviews={reviews} onChanged={() => {}} />
            )
          ) : tab === "requests" ? (
            loading ? (
              <p className="admin-loading">Loading requests…</p>
            ) : (
              <RequestsPanel requests={requests} onChanged={() => {}} />
            )
          ) : tab === "orders" ? (
            loading ? (
              <p className="admin-loading">Loading orders…</p>
            ) : (
              <OrdersPanel orders={orders} onChanged={() => {}} />
            )
          ) : tab === "coupons" ? (
            <CouponsPanel coupons={coupons} />
          ) : loading ? (
            <p className="admin-loading">Loading products…</p>
          ) : (
            <div className="admin-products-layout">
              <div className="admin-panel-card">
                <div className="admin-panel-header">
                  <h3>Product List ({products.length})</h3>
                  <div className="admin-panel-actions">
                    <div className="admin-search-wrap sm">
                      <Search size={14} />
                      <input type="text" placeholder="Search products..." className="admin-search-input sm" />
                    </div>
                    <select className="admin-input-sm">
                      <option>Newest First</option>
                    </select>
                  </div>
                </div>
                <div className="admin-table">
                  {products.map((p) => (
                    <div className="admin-row" key={p.slug}>
                      <img className="admin-thumb" src={p.images[0]} alt={p.name} />
                      <div className="admin-row-main">
                        <p className="admin-row-name">{p.name}</p>
                        <p className="admin-row-meta">
                          {categories.find((c) => c.slug === p.category)?.name ?? p.category}{" "}
                          · {p.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}{" "}
                          <s style={{ opacity: 0.5 }}>{p.mrp.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</s>
                        </p>
                        {p.inStock ? (
                          <span className="admin-pill success">In stock</span>
                        ) : (
                          <span className="admin-pill danger">Out of stock</span>
                        )}
                      </div>
                      <div className="admin-row-toggles">
                        <label className="admin-check">
                          <input
                            type="checkbox"
                            checked={!!p.featured}
                            onChange={(e) => toggleFeatured(p, e.target.checked)}
                          />
                          Featured
                        </label>
                        <label className="admin-check">
                          <input
                            type="checkbox"
                            checked={p.inStock !== false}
                            onChange={(e) => toggleStock(p, e.target.checked)}
                          />
                          In stock
                        </label>
                        <label className="admin-check admin-qty">
                          Qty{" "}
                          <input
                            type="number"
                            className="admin-qty-input"
                            value={p.stockQty ?? ""}
                            onChange={(e) => updateQty(p, e.target.value)}
                            placeholder="∞"
                          />
                        </label>
                      </div>
                      <div className="admin-row-actions">
                        <button
                          className="admin-action-btn edit"
                          onClick={() => setEditing(p)}
                        >
                          EDIT
                        </button>
                        <button
                          className="admin-action-btn delete"
                          onClick={() => remove(p)}
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-panel-card right-col">
                <div className="admin-panel-header">
                  <h3>Categories</h3>
                </div>
                <CategoriesEditor categories={categories} onSaved={loadStaticData} />
              </div>
            </div>
          )}
        </div>
      </main>
`;

const matchStr = '<main className="page-main">\n      <div className="admin-wrap">';
const startIdx = tsx.indexOf(matchStr);
const endIdx = tsx.indexOf('{editing && (', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  tsx = tsx.substring(0, startIdx) + newMainLayout + '\n        ' + tsx.substring(endIdx);
} else {
  console.log("Could not find the target layout block!");
  process.exit(1);
}

// Ensure in CategoriesEditor the title is removed because it's now in the header
tsx = tsx.replace(
  /<h2 className="admin-title">Categories<\/h2>\s*<div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>/g,
  '<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>'
);
// Make ADD CATEGORY button golden
tsx = tsx.replace(
  /<button className="admin-btn-sm" onClick=\{\(\) => setEditing\("new"\)\}>/g,
  '<button className="btn-gold admin-btn-sm" onClick={() => setEditing("new")}>'
);

// We must also replace the closing tags correctly!
// In the original file, after `{editing && ( ... )}` there was:
//       </div>
//     </main>
//   );
// }
// We want to replace it with just:
//       </div>
//   );
// }
tsx = tsx.replace(
  /        \)}\n      <\/div>\n    <\/main>\n  \);\n}/,
  '        )}\n      </div>\n  );\n}'
);


fs.writeFileSync(tsxPath, tsx);
console.log("AdminPage.tsx updated successfully!");

