const fs = require('fs');
const path = require('path');

const tsxPath = path.join(__dirname, 'src/app/admin/page.tsx');
let tsx = fs.readFileSync(tsxPath, 'utf8');

// 1. Add badges to Products and Categories in Sidebar
tsx = tsx.replace(
  /<FolderTree size=\{18\} \/> <span>Categories<\/span>/,
  '<FolderTree size={18} /> <span>Categories</span>\n                {categories.length > 0 && <span className="admin-badge">{categories.length}</span>}'
);
tsx = tsx.replace(
  /<Package size=\{18\} \/> <span>Products<\/span>/,
  '<Package size={18} /> <span>Products</span>\n                {products.length > 0 && <span className="admin-badge">{products.length}</span>}'
);

// 2. Add editingCategory state to Dashboard
// Find `const [editing, setEditing] = useState<EditTarget>(null);`
tsx = tsx.replace(
  'const [editing, setEditing] = useState<EditTarget>(null);',
  'const [editing, setEditing] = useState<EditTarget>(null);\n  const [editingCategory, setEditingCategory] = useState<Category | "new" | null>(null);'
);

// 3. Add `+ ADD CATEGORY` to topbar
// Find `+ ADD PRODUCT` and add the category button
const addProductBtn = `{tab === "products" && (
              <button className="btn-gold admin-btn-sm" onClick={() => setEditing("new")}>
                + ADD PRODUCT
              </button>
            )}`;
const addCategoryBtn = `
            {tab === "categories" && (
              <button className="btn-gold admin-btn-sm" onClick={() => setEditingCategory("new")}>
                + ADD CATEGORY
              </button>
            )}`;
tsx = tsx.replace(addProductBtn, addProductBtn + addCategoryBtn);

// 4. Update the Categories view inside Dashboard to render a list and conditional edit modal
// We have:
/*
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
*/
const oldCatPanel = `          ) : tab === "categories" ? (
            <div className="admin-panel-card" style={{ maxWidth: 800 }}>
              <div className="admin-panel-header">
                <h3>All Categories</h3>
                <button className="btn-gold admin-btn-sm" onClick={() => setEditing("new")}>
                  + ADD CATEGORY
                </button>
              </div>
              <CategoriesEditor categories={categories} onSaved={loadStaticData} />
            </div>`;

const newCatPanel = `          ) : tab === "categories" ? (
            <div className="admin-panel-card">
              <div className="admin-panel-header">
                <h3>All Categories ({categories.length})</h3>
                <div className="admin-panel-actions">
                  <div className="admin-search-wrap sm">
                    <Search size={14} />
                    <input type="text" placeholder="Search categories..." className="admin-search-input sm" />
                  </div>
                </div>
              </div>
              <div className="admin-table">
                {categories.map((c) => (
                  <div className="admin-row" key={c.slug}>
                    {c.image ? <img className="admin-thumb" src={c.image} alt={c.name} /> : <div className="admin-thumb" style={{background: '#333'}} />}
                    <div className="admin-row-main">
                      <p className="admin-row-name">{c.name}</p>
                      <p className="admin-row-meta">{c.tagline || 'No tagline'}</p>
                    </div>
                    <div className="admin-row-toggles">
                      <span className="admin-pill" style={{opacity: 0.7}}>Order: {c.order ?? 0}</span>
                    </div>
                    <div className="admin-row-actions">
                      <button className="admin-action-btn edit" onClick={() => setEditingCategory(c)}>
                        EDIT
                      </button>
                      <button className="admin-action-btn delete" onClick={async () => {
                        if (confirm(\`Delete category "\${c.name}"?\`)) {
                          try {
                            await deleteDoc(doc(db, "categories", c.slug));
                            loadStaticData();
                          } catch {}
                        }
                      }}>
                        DELETE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>`;
tsx = tsx.replace(oldCatPanel, newCatPanel);


// 5. Add Category Editor Modal right below Product Editor Modal
/*
        {editing && (
          <ProductForm
            ...
          />
        )}
*/
const oldProductForm = `        {editing && (
          <ProductForm
            product={editing === "new" ? null : editing}
            categories={categories}
            nextSortOrder={products.length}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              loadStaticData();
            }}
          />
        )}`;

const newCategoryForm = `
        {editingCategory && (
          <div className="admin-modal">
            <div className="admin-modal-content" style={{maxWidth: 500}}>
              <div className="admin-panel-header">
                <h3>{editingCategory === "new" ? "Add Category" : "Edit Category"}</h3>
                <button className="admin-close-btn" onClick={() => setEditingCategory(null)}>×</button>
              </div>
              <CategoryCard 
                category={editingCategory === "new" ? null : editingCategory}
                onSaved={() => {
                  setEditingCategory(null);
                  loadStaticData();
                }}
                onCancel={() => setEditingCategory(null)}
              />
            </div>
          </div>
        )}`;
tsx = tsx.replace(oldProductForm, oldProductForm + newCategoryForm);


// 6. Clean up CategoryCard component so it doesn't have the outer padding/card layout, since it's now in a modal
// We will replace `className="admin-card"` inside CategoryCard with something simpler like `className="admin-form-group"`
tsx = tsx.replace(/<div className="admin-card">/g, '<div className="admin-form-group">');
tsx = tsx.replace(
  /<button\s*className="btn-gold admin-btn-sm"\s*onClick=\{save\}\s*disabled=\{busy\}\s*>\s*SAVE\s*<\/button>\s*\{!isNew && \(\s*<button\s*className="btn-rose admin-btn-sm"\s*onClick=\{remove\}\s*disabled=\{busy\}\s*>\s*DELETE\s*<\/button>\s*\)\}/g,
  '<button className="btn-gold admin-btn-sm" onClick={save} disabled={busy}>SAVE</button>'
);

// We can also remove `CategoriesEditor` entirely since it's unused, but it's fine to leave it or remove it.
// Let's remove it to avoid clutter
const catsEditorRegex = /function CategoriesEditor\([\s\S]*?\}\s*\}\s*\)\s*\}\s*<\/div>\s*<\/div>\s*\);\s*\}/;
tsx = tsx.replace(catsEditorRegex, '');


fs.writeFileSync(tsxPath, tsx);
console.log("AdminPage updated for categories!");
