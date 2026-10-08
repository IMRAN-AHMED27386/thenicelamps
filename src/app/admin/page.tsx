"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, MessageSquare, Star, Tag, Settings, LogOut, Search, User as UserIcon, LayoutDashboard, FolderTree } from "lucide-react";
import { getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage, firebaseConfig } from "@/lib/firebase";
import { Category, Product, CategorySlug, inr } from "@/lib/catalog";
import { Order, ORDER_STATUSES, OrderStatus, Coupon } from "@/lib/orders";
import { Review, deleteReview } from "@/lib/reviews";
import { showToast } from "@/lib/toast";

export type AdminPermissions = {
  products: boolean;
  orders: boolean;
  requests: boolean;
  reviews: boolean;
  admins: boolean;
  settings: boolean;
  coupons: boolean;
};

const SUPER_ADMIN = "imran27386@gmail.com";
const FULL_PERMS: AdminPermissions = { products: true, orders: true, requests: true, reviews: true, admins: true, settings: true, coupons: true };
const DEFAULT_PERMS: AdminPermissions = { products: false, orders: false, requests: false, reviews: false, admins: false, settings: false, coupons: false };

type EditTarget = Product | "new" | null;

type StockRequest = {
  id: string;
  email: string;
  productSlug: string;
  productName: string;
  createdAt: string;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function UploadButton({
  folder,
  onDone,
  kind = "photo",
}: {
  folder: string;
  onDone: (url: string) => void;
  kind?: "photo" | "video";
}) {
  const [busy, setBusy] = useState(false);

  const pick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = kind === "video" ? "video/*" : "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (kind === "video" && file.size > 60 * 1024 * 1024) {
        showToast("Video is too large — keep it under 60 MB", false);
        return;
      }
      setBusy(true);
      try {
        const clean = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
        const path = `${folder}/${Date.now()}-${clean}`;
        const snap = await uploadBytes(ref(storage, path), file, {
          contentType: file.type,
        });
        const url = await getDownloadURL(snap.ref);
        onDone(url);
        showToast(kind === "video" ? "Video uploaded 💖" : "Photo uploaded 💖");
      } catch (e) {
        const code =
          (e as { code?: string })?.code ??
          (e as Error)?.message ??
          "unknown error";
        showToast(`Upload failed: ${code}`, false);
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };

  return (
    <button
      type="button"
      className="admin-upload"
      onClick={pick}
      disabled={busy}
    >
      {busy ? "Uploading…" : kind === "video" ? "⬆ Upload video" : "⬆ Upload photo"}
    </button>
  );
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setPermissionsLoaded(false);
        try {
          if (u.email === SUPER_ADMIN) {
            setPermissions(FULL_PERMS);
          } else {
            const [uidSnap, emailSnap] = await Promise.all([
              getDoc(doc(db, "admins", u.uid)),
              u.email ? getDoc(doc(db, "admins", u.email.toLowerCase())) : Promise.resolve(null)
            ]);
            const snap = uidSnap.exists() ? uidSnap : (emailSnap?.exists() ? emailSnap : null);
            if (snap) {
              setPermissions({ ...DEFAULT_PERMS, ...(snap.data() as Partial<AdminPermissions>) });
            } else {
              setPermissions(null);
            }
          }
        } catch {
          setPermissions(null);
        }
        setPermissionsLoaded(true);
      } else {
        setPermissions(null);
        setPermissionsLoaded(true);
      }
      setAuthReady(true);
    });
  }, []);

  if (!authReady || (user && !permissionsLoaded)) {
    return (
      <main className="page-main">
        <p className="admin-loading">Loading…</p>
      </main>
    );
  }

  if (!user) return <Login />;

  if (!permissions) {
    return (
      <main className="page-main">
        <div className="admin-card admin-narrow">
          <h1 className="admin-title">Not authorized</h1>
          <p className="admin-sub">
            This account ({user.email}) is not a store admin.
          </p>
          <button className="btn-rose admin-btn" onClick={() => signOut(auth)}>
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return <Dashboard currentUser={user} permissions={permissions} onSignOut={() => signOut(auth)} />;
}

function Login() {
  const [email, setEmail] = useState("contact@thenicelamps.com");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const login = async () => {
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      showToast("Welcome back 💖");
    } catch {
      showToast("Login failed — check email and password", false);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      showToast("Password reset email sent to " + email.trim());
    } catch {
      showToast("Could not send reset email", false);
    }
  };

  return (
    <main className="page-main">
      <div className="admin-card admin-narrow">
        <p className="s-eyebrow">TheNiceLamps</p>
        <h1 className="admin-title">Admin Login</h1>
        <label className="admin-label">Email</label>
        <input
          className="admin-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="admin-label">Password</label>
        <input
          className="admin-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
        />
        <button
          className="btn-rose admin-btn"
          onClick={login}
          disabled={busy}
        >
          <span className="btn-ico">✦</span> {busy ? "Signing in…" : "Sign In"}
        </button>
        <button className="admin-linkbtn" onClick={reset}>
          Forgot / set password? Send reset email
        </button>
      </div>
    </main>
  );
}

function Dashboard({
  currentUser,
  permissions,
  onSignOut,
}: {
  currentUser: User;
  permissions: AdminPermissions;
  onSignOut: () => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  
  const getInitialTab = (): string => {
    if (permissions.products) return "overview";
    if (permissions.orders) return "orders";
    if (permissions.requests) return "requests";
    if (permissions.reviews) return "reviews";
    if (permissions.coupons) return "coupons";
    if (permissions.settings) return "settings";
    if (permissions.admins) return "admins";
    return "products";
  };
  
  const [tab, setTab] = useState<string>(getInitialTab());
  const [editing, setEditing] = useState<EditTarget>(null);
  const [editingCategory, setEditingCategory] = useState<Category | "new" | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStaticData = async () => {
    try {
      const [pSnap, cSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "categories")),
      ]);
      const prods = pSnap.docs
        .map((d) => ({ slug: d.id, ...d.data() }) as Product)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      const cats = cSnap.docs
        .map((d) => ({ slug: d.id, ...d.data() }) as unknown as Category)
        .sort(
          (a, b) =>
            ((a as unknown as { order?: number }).order ?? 0) -
            ((b as unknown as { order?: number }).order ?? 0)
        );
      setProducts(prods);
      setCategories(cats);
    } catch {
      showToast("Failed to load static data", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaticData();

    const unsubs = [
      onSnapshot(collection(db, "orders"), (snap) => {
        setOrders(
          snap.docs
            .map((d) => d.data() as Order)
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        );
      }),
      onSnapshot(collection(db, "stockRequests"), (snap) => {
        setRequests(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }) as StockRequest)
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        );
      }),
      onSnapshot(collection(db, "reviews"), (snap) => {
        setReviews(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }) as Review)
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        );
      }),
      onSnapshot(collection(db, "coupons"), (snap) => {
        setCoupons(
          snap.docs
            .map((d) => ({ id: d.id, code: d.id, ...d.data() }) as Coupon)
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        );
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, []);

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "products", p.slug));
      showToast("Deleted " + p.name);
      loadStaticData();
    } catch {
      showToast("Delete failed", false);
    }
  };

  const quickToggle = async (
    p: Product,
    field: "featured" | "inStock",
    value: boolean
  ) => {
    try {
      await setDoc(
        doc(db, "products", p.slug),
        { [field]: value },
        { merge: true }
      );
      setProducts((prev) =>
        prev.map((x) => (x.slug === p.slug ? { ...x, [field]: value } : x))
      );
    } catch {
      showToast("Update failed", false);
    }
  };

  const quickSetQty = async (p: Product, qty: number | null) => {
    try {
      await setDoc(
        doc(db, "products", p.slug),
        { stockQty: qty },
        { merge: true }
      );
      setProducts((prev) =>
        prev.map((x) => (x.slug === p.slug ? { ...x, stockQty: qty } : x))
      );
      showToast(
        qty === null
          ? `${p.name}: stock count off`
          : `${p.name}: stock set to ${qty}`
      );
    } catch {
      showToast("Update failed", false);
    }
  };

  return (
    
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="admin-logo-text">THENICELAMPS</span>
          <span className="admin-logo-sub">ADMIN</span>
        </div>
        
        
        <nav className="admin-nav">
          <button className={`admin-nav-item ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab("overview")}>
            <LayoutDashboard size={18} /> <span>Overview</span>
          </button>
          {permissions.products && (
            <>
              <button className={`admin-nav-item ${tab === 'categories' ? 'active' : ''}`} onClick={() => setTab("categories")}>
                <FolderTree size={18} /> <span>Categories</span>
                {categories.length > 0 && <span className="admin-badge">{categories.length}</span>}
              </button>
              <button className={`admin-nav-item ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab("products")}>
                <Package size={18} /> <span>Products</span>
                {products.length > 0 && <span className="admin-badge">{products.length}</span>}
              </button>
            </>
          )}

          {permissions.orders && (
            <button className={`admin-nav-item ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab("orders")}>
              <ShoppingCart size={18} /> <span>Orders</span>
              {orders.length > 0 && <span className="admin-badge">{orders.length}</span>}
            </button>
          )}
          {permissions.requests && (
            <button className={`admin-nav-item ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab("requests")}>
              <MessageSquare size={18} /> <span>Requests</span>
              {requests.length > 0 && <span className="admin-badge">{requests.length}</span>}
            </button>
          )}
          {permissions.reviews && (
            <button className={`admin-nav-item ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab("reviews")}>
              <Star size={18} /> <span>Reviews</span>
              {reviews.length > 0 && <span className="admin-badge">{reviews.length}</span>}
            </button>
          )}
          {permissions.coupons && (
            <button className={`admin-nav-item ${tab === 'coupons' ? 'active' : ''}`} onClick={() => setTab("coupons")}>
              <Tag size={18} /> <span>Coupons</span>
              {coupons.length > 0 && <span className="admin-badge">{coupons.length}</span>}
            </button>
          )}
          {permissions.settings && (
            <button className={`admin-nav-item ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab("settings")}>
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
            {tab === "overview"
                ? "Overview"
                : tab === "categories"
                  ? "Categories"
                  : tab === "products" && (
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
              {tab === "overview" && "Dashboard summary and reports"}
              {tab === "categories" && "Manage your product categories"}
              {tab === "products" && "Manage your products and inventory"}
              {tab === "orders" && "View and manage customer orders"}
              {tab === "settings" && "Configure store settings"}
            </p>
          </div>

          {tab === "overview" && (
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
          ) : tab === "categories" ? (
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
                      <span className="admin-pill" style={{opacity: 0.7}}>Order: {(c as any).order ?? 0}</span>
                    </div>
                    <div className="admin-row-actions">
                      <button className="admin-action-btn edit" onClick={() => setEditingCategory(c)}>
                        EDIT
                      </button>
                      <button className="admin-action-btn delete" onClick={async () => {
                        if (confirm(`Delete category "${c.name}"?`)) {
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
            </div>
          ) : tab === "overview" ? (
            <div className="admin-overview-content">
              {/* Optional: Add recent orders or more stats here later */}
            </div>
          ) : loading ? (
            <p className="admin-loading">Loading products…</p>
          ) : (
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
                            onChange={(e) => quickToggle(p, "featured", e.target.checked)}
                          />
                          Featured
                        </label>
                        <label className="admin-check">
                          <input
                            type="checkbox"
                            checked={p.inStock !== false}
                            onChange={(e) => quickToggle(p, "inStock", e.target.checked)}
                          />
                          In stock
                        </label>
                        <label className="admin-check admin-qty">
                          Qty{" "}
                          <input
                            type="number"
                            className="admin-qty-input"
                            value={p.stockQty ?? ""}
                            onChange={(e) => quickSetQty(p, e.target.value ? parseInt(e.target.value) : null)}
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
          )}
        </div>
      </main>

        {editing && (
          <ProductForm
            key={editing === "new" ? "new" : editing.slug}
            product={editing === "new" ? null : editing}
            categories={categories}
            nextSortOrder={products.length}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              loadStaticData();
            }}
          />
        )}
      </div>
  );
}

function RequestsPanel({
  requests,
  onChanged,
}: {
  requests: StockRequest[];
  onChanged: () => void;
}) {
  const removeReq = async (r: StockRequest) => {
    try {
      await deleteDoc(doc(db, "stockRequests", r.id));
      showToast("Request removed");
      onChanged();
    } catch {
      showToast("Delete failed", false);
    }
  };

  if (requests.length === 0) {
    return (
      <p className="admin-loading">
        No stock requests yet. When a customer taps &quot;Notify Me&quot; on an
        out-of-stock product, their email shows up here.
      </p>
    );
  }

  // group by product
  const byProduct = new Map<string, StockRequest[]>();
  for (const r of requests) {
    const list = byProduct.get(r.productSlug) ?? [];
    list.push(r);
    byProduct.set(r.productSlug, list);
  }
  const groups = [...byProduct.values()].sort((a, b) => b.length - a.length);

  return (
    <div className="admin-table">
      {groups.map((group) => (
        <div className="admin-card req-group" key={group[0].productSlug}>
          <p className="req-title">
            {group[0].productName}{" "}
            <span className="req-count">
              {group.length} waiting
            </span>
          </p>
          {group.map((r) => (
            <div className="req-row" key={r.id}>
              <span className="req-email">{r.email}</span>
              <span className="req-date">
                {new Date(r.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <button
                className="admin-linkbtn admin-danger"
                onClick={() => removeReq(r)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function QtyCell({
  product,
  onSave,
}: {
  product: Product;
  onSave: (p: Product, qty: number | null) => void;
}) {
  const current =
    typeof product.stockQty === "number" ? String(product.stockQty) : "";
  const [val, setVal] = useState(current);

  useEffect(() => {
    setVal(
      typeof product.stockQty === "number" ? String(product.stockQty) : ""
    );
  }, [product.stockQty]);

  const commit = () => {
    const trimmed = val.trim();
    const qty =
      trimmed === "" ? null : Math.max(0, Math.floor(Number(trimmed)));
    if (qty !== null && Number.isNaN(qty)) {
      setVal(current);
      return;
    }
    if (qty === (typeof product.stockQty === "number" ? product.stockQty : null))
      return;
    onSave(product, qty);
  };

  return (
    <label className="admin-check admin-qty">
      Qty
      <input
        className="admin-qty-input"
        type="number"
        min={0}
        placeholder="—"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) =>
          e.key === "Enter" && (e.target as HTMLInputElement).blur()
        }
      />
    </label>
  );
}

function OrdersPanel({
  orders,
  onChanged,
}: {
  orders: Order[];
  onChanged: () => void;
}) {
  const [syncing, setSyncing] = useState(false);

  const setStatus = async (o: Order, status: OrderStatus) => {
    try {
      const prevStatus = o.status;
      await setDoc(doc(db, "orders", o.id), { status }, { merge: true });

      // When marking as delivered, ensure product soldCount and stock are updated in Firestore
      if (status === "delivered" && prevStatus !== "delivered") {
        for (const it of o.items || []) {
          const s = it.slug || (it as any).product?.slug;
          if (s) {
            try {
              const pRef = doc(db, "products", s);
              const snap = await getDoc(pRef);
              if (snap.exists()) {
                const pData = snap.data();
                const currentSold = typeof pData.soldCount === "number" ? pData.soldCount : 0;
                const currentStock = typeof pData.stockQty === "number" ? pData.stockQty : null;
                const q = it.qty || (it as any).quantity || 1;
                const updates: Record<string, any> = {
                  soldCount: currentSold + q,
                };
                if (currentStock !== null && currentStock > 0) {
                  const nextStock = Math.max(0, currentStock - q);
                  updates.stockQty = nextStock;
                  if (nextStock === 0) updates.inStock = false;
                }
                await updateDoc(pRef, updates);
              }
            } catch (e) {
              console.error("Failed to update product stats", e);
            }
          }
        }
      }

      showToast(`${o.id} → ${status}`);
      onChanged();
    } catch {
      showToast("Status update failed", false);
    }
  };

  const syncSoldCounts = async () => {
    setSyncing(true);
    try {
      const totals: Record<string, number> = {};
      for (const o of orders) {
        if (o.status === "cancelled") continue;
        for (const it of o.items || []) {
          const s = it.slug || (it as any).product?.slug;
          if (s) {
            const q = it.qty || (it as any).quantity || 1;
            totals[s] = (totals[s] || 0) + q;
          }
        }
      }
      for (const [slug, count] of Object.entries(totals)) {
        const pRef = doc(db, "products", slug);
        const snap = await getDoc(pRef);
        if (snap.exists()) {
          const currentSold = snap.data().soldCount || 0;
          await updateDoc(pRef, { soldCount: Math.max(currentSold, count) });
        }
      }
      showToast("Synced sold quantities for all products! 💖");
      onChanged();
    } catch {
      showToast("Sync failed", false);
    } finally {
      setSyncing(false);
    }
  };

  const remove = async (o: Order) => {
    if (!confirm(`Delete order ${o.id}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "orders", o.id));
      showToast("Order deleted");
      onChanged();
    } catch {
      showToast("Delete failed", false);
    }
  };

  if (orders.length === 0) {
    return (
      <p className="admin-loading">
        No orders yet — they&rsquo;ll appear here the moment a customer checks
        out.
      </p>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          className="btn-rose admin-btn-sm"
          onClick={syncSoldCounts}
          disabled={syncing}
        >
          {syncing ? "Syncing…" : "⚡ Sync Sold Quantities to Store"}
        </button>
      </div>
      <div className="admin-table">
      {orders.map((o) => (
        <div className="order-card" key={o.id}>
          <div className="order-top">
            <div>
              <p className="admin-row-name">{o.id}</p>
              <p className="admin-row-meta">
                {new Date(o.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                · {o.payment.toUpperCase()} · <strong>{inr(o.total)}</strong>
              </p>
            </div>
            <div className="order-top-actions">
              <select
                className={`admin-input order-status st-${o.status}`}
                value={o.status}
                onChange={(e) => setStatus(o, e.target.value as OrderStatus)}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                className="admin-linkbtn admin-danger"
                onClick={() => remove(o)}
              >
                Delete
              </button>
            </div>
          </div>

          <div className="order-body">
            <div>
              <p className="admin-label">Customer</p>
              <p className="order-line">{o.customer.name}</p>
              <p className="order-line">
                <a
                  href={`https://wa.me/91${o.customer.phone}`}
                  target="_blank"
                  rel="noopener"
                  className="order-wa"
                >
                  {o.customer.phone} (WhatsApp)
                </a>
              </p>
              {o.customer.email && (
                <p className="order-line">{o.customer.email}</p>
              )}
              <p className="order-line order-addr">
                {o.customer.address}, {o.customer.city}, {o.customer.state}{" "}
                {o.customer.pincode}
              </p>
            </div>
            <div>
              <p className="admin-label">Items</p>
              {o.items.map((i, idx) => (
                <p className="order-line" key={idx}>
                  {i.qty} × {i.name} ({i.size}) — {inr(i.price * i.qty)}
                </p>
              ))}
              <p className="order-line" style={{ marginTop: 8 }}>
                Delivery: {o.delivery === 0 ? "Free" : inr(o.delivery)}
              </p>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

type AdminEntry = { uid: string; email: string; addedAt?: string; note?: string };

function AdminsPanel({ currentUser }: { currentUser: User }) {
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "admins"));
      setAdmins(
        snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as AdminEntry)
      );
    } catch {
      showToast("Failed to load admins", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addAdmin = async () => {
    const em = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      showToast("Please enter a valid email address", false);
      return;
    }
    if (admins.some((a) => a.email === em)) {
      showToast("This email is already an admin", false);
      return;
    }
    setBusy(true);
    try {
      // Secondary app so creating the new user doesn't sign the owner out.
      const secondary =
        getApps().find((a) => a.name === "secondary") ??
        initializeApp(firebaseConfig, "secondary");
      const secAuth = getAuth(secondary);
      const bytes = new Uint8Array(24);
      crypto.getRandomValues(bytes);
      const tempPwd = Array.from(bytes, (b) =>
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(
          b % 62
        )
      ).join("");
      const cred = await createUserWithEmailAndPassword(secAuth, em, tempPwd);
      await setDoc(doc(db, "admins", cred.user.uid), {
        ...DEFAULT_PERMS,
        email: em,
        addedAt: new Date().toISOString(),
        note: `Added by ${currentUser.email}`,
      });
      await sendPasswordResetEmail(secAuth, em);
      await signOut(secAuth);
      setEmail("");
      showToast(
        `Admin added — setup email sent to ${em}. Tell them to check Spam/Junk too!`
      );
      load();
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === "auth/email-already-in-use") {
        await setDoc(doc(db, "admins", em), {
          ...DEFAULT_PERMS,
          email: em,
          addedAt: new Date().toISOString(),
          note: `Linked existing account by ${currentUser.email}`,
        });
        setEmail("");
        showToast(`Linked existing account ${em} as admin!`);
        load();
      } else {
        showToast("Could not add admin", false);
      }
    } finally {
      setBusy(false);
    }
  };

  const resendSetup = async (a: AdminEntry) => {
    try {
      await sendPasswordResetEmail(auth, a.email);
      showToast(`Setup email re-sent to ${a.email} — check Spam/Junk too`);
    } catch (e) {
      const code = (e as { code?: string })?.code ?? "error";
      showToast(`Could not send email: ${code}`, false);
    }
  };

  const removeAdmin = async (a: AdminEntry) => {
    if (a.uid === currentUser.uid) {
      showToast("You cannot remove yourself", false);
      return;
    }
    if (!confirm(`Remove admin access for ${a.email}?`)) return;
    try {
      await deleteDoc(doc(db, "admins", a.uid));
      showToast(`${a.email} is no longer an admin`);
      load();
    } catch {
      showToast("Remove failed", false);
    }
  };

  const togglePermission = async (a: AdminEntry, perm: keyof AdminPermissions) => {
    if (a.email === SUPER_ADMIN) {
      showToast("Super admin permissions cannot be changed", false);
      return;
    }
    try {
      // Create a temporary updated permission object
      const currentVal = (a as any)[perm] ?? false;
      const updated = { [perm]: !currentVal };
      await updateDoc(doc(db, "admins", a.uid), updated);
      showToast("Permissions updated!");
      load(); // Reload to reflect changes
    } catch {
      showToast("Failed to update permissions", false);
    }
  };

  return (
    <div className="admin-wrap">
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h2 className="checkout-h2">Add an admin</h2>
        <p className="admin-sub" style={{ fontSize: "0.84rem" }}>
          They&rsquo;ll get an email to set their own password, then can sign
          in at /admin with full access (products, orders, admins).
        </p>
        <div className="admin-imgrow">
          <input
            className="admin-input"
            type="email"
            placeholder="new-admin@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addAdmin()}
          />
          <button
            className="btn-rose admin-btn-sm"
            onClick={addAdmin}
            disabled={busy}
          >
            {busy ? "Adding…" : "+ Add Admin"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="admin-loading">Loading admins…</p>
      ) : (
        <div className="admin-table">
          {admins.map((a) => {
            const isSuper = a.email === SUPER_ADMIN;
            return (
              <div className="admin-row" key={a.uid} style={{ gridTemplateColumns: "1fr", gap: "16px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p className="admin-row-name">
                      {a.email}
                      {a.uid === currentUser.uid && (
                        <span className="admin-count"> (you)</span>
                      )}
                      {isSuper && (
                        <span className="admin-count" style={{ color: "#d4af37" }}> [SUPER ADMIN]</span>
                      )}
                    </p>
                    <p className="admin-row-meta">
                      {a.note ? `${a.note} · ` : ""}
                      {a.addedAt
                        ? new Date(a.addedAt).toLocaleDateString("en-IN", {
                            dateStyle: "medium",
                          })
                        : ""}
                    </p>
                  </div>
                  <div className="admin-row-actions">
                    <button
                      className="admin-linkbtn"
                      onClick={() => resendSetup(a)}
                    >
                      Resend email
                    </button>
                    {a.uid !== currentUser.uid && !isSuper && (
                      <button
                        className="admin-linkbtn admin-danger"
                        onClick={() => removeAdmin(a)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Permissions Grid */}
                <div style={{ marginTop: 12, padding: "16px", background: "rgba(0,0,0,0.4)", borderRadius: 12, display: "flex", flexWrap: "wrap", gap: 16 }}>
                  <p className="s-eyebrow" style={{ width: "100%", margin: 0, marginBottom: 8 }}>Permissions</p>
                  {Object.keys(DEFAULT_PERMS).map((key) => {
                    const perm = key as keyof AdminPermissions;
                    const val = isSuper ? true : ((a as any)[perm] ?? false);
                    return (
                      <label key={perm} className="admin-check" style={{ opacity: isSuper ? 0.5 : 1 }}>
                        <input 
                          type="checkbox" 
                          checked={val} 
                          disabled={isSuper}
                          onChange={() => togglePermission(a, perm)} 
                        />
                        <span style={{ textTransform: "capitalize" }}>{perm}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProductForm({
  product,
  categories,
  nextSortOrder,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  nextSortOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState<string>(
    product?.category ?? categories[0]?.slug ?? "pakistani-suits"
  );
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [mrp, setMrp] = useState(String(product?.mrp ?? ""));
  const [fabric, setFabric] = useState(product?.fabric ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [sizes, setSizes] = useState(
    (product?.sizes ?? ["Standard"]).join(", ")
  );
  const [images, setImages] = useState<string[]>(
    product?.images?.length ? product.images : [""]
  );
  const [video, setVideo] = useState(product?.video ?? "");
  const [featured, setFeatured] = useState(!!product?.featured);

  const MAX_IMAGES = 5;
  const setImageAt = (i: number, url: string) =>
    setImages((prev) => prev.map((x, idx) => (idx === i ? url : x)));
  const addImage = () =>
    setImages((prev) =>
      prev.length < MAX_IMAGES ? [...prev, ""] : prev
    );
  const removeImage = (i: number) =>
    setImages((prev) =>
      prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev
    );
  const [inStock, setInStock] = useState(product?.inStock !== false);
  const [stockQty, setStockQty] = useState(
    typeof product?.stockQty === "number" ? String(product.stockQty) : ""
  );
  const [soldCount, setSoldCount] = useState(
    typeof product?.soldCount === "number" ? String(product.soldCount) : ""
  );
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const priceN = Number(price);
    const mrpN = Number(mrp || price);
    const cleanImages = images.map((x) => x.trim()).filter(Boolean);
    if (!name.trim() || !priceN || cleanImages.length === 0) {
      showToast("Name, price and at least one photo are required", false);
      return;
    }
    const baseSlug = slugify(name);
    const slug = product?.slug ?? `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    setBusy(true);
    try {
      await setDoc(
        doc(db, "products", slug),
        {
          name: name.trim(),
          category: category as CategorySlug,
          price: priceN,
          mrp: mrpN,
          fabric: fabric.trim(),
          description: description.trim(),
          sizes: sizes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          images: cleanImages,
          video: video.trim(),
          featured,
          inStock,
          stockQty:
            stockQty.trim() === "" || Number.isNaN(Number(stockQty))
              ? null
              : Math.max(0, Math.floor(Number(stockQty))),
          soldCount:
            soldCount.trim() === "" || Number.isNaN(Number(soldCount))
              ? 0
              : Math.max(0, Math.floor(Number(soldCount))),
          sortOrder: product?.sortOrder ?? nextSortOrder,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      showToast(product ? "Product updated 💖" : "Product added 💖");
      onSaved();
    } catch {
      showToast("Save failed", false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-modal">
      <div className="admin-card admin-form">
        <h2 className="admin-title">
          {product ? "Edit Product" : "New Product"}
        </h2>

        <label className="admin-label">Name</label>
        <input
          className="admin-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="admin-grid2">
          <div>
            <label className="admin-label">Category</label>
            <select
              className="admin-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Material / Finish</label>
            <input
              className="admin-input"
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-grid2">
          <div>
            <label className="admin-label">Price (₹)</label>
            <input
              className="admin-input"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">MRP (₹, before discount)</label>
            <input
              className="admin-input"
              type="number"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
            />
          </div>
        </div>

        <label className="admin-label">Description</label>
        <textarea
          className="admin-input admin-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="admin-label">Sizes (comma separated)</label>
        <input
          className="admin-input"
          value={sizes}
          onChange={(e) => setSizes(e.target.value)}
        />

        <label className="admin-label">
          Photos ({images.filter((x) => x.trim()).length}/{MAX_IMAGES}) — first
          photo is the main one
        </label>
        {images.map((img, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div className="admin-imgrow admin-imgrow-3">
              <input
                className="admin-input"
                value={img}
                onChange={(e) => setImageAt(i, e.target.value)}
                placeholder={
                  i === 0 ? "Main photo — https://… or upload →" : "https://… or upload →"
                }
              />
              <UploadButton folder="products" onDone={(url) => setImageAt(i, url)} />
              {images.length > 1 && (
                <button
                  type="button"
                  className="admin-linkbtn admin-danger"
                  onClick={() => removeImage(i)}
                  aria-label={`Remove photo ${i + 1}`}
                >
                  ✕
                </button>
              )}
            </div>
            {img.trim() && (
              <img className="admin-preview" src={img} alt={`preview ${i + 1}`} />
            )}
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <button type="button" className="admin-linkbtn" onClick={addImage}>
            + Add another photo
          </button>
        )}

        <label className="admin-label">Video clip (optional, under 60 MB)</label>
        <div className="admin-imgrow admin-imgrow-3">
          <input
            className="admin-input"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="https://… or upload →"
          />
          <UploadButton
            folder="videos"
            kind="video"
            onDone={setVideo}
          />
          {video.trim() && (
            <button
              type="button"
              className="admin-linkbtn admin-danger"
              onClick={() => setVideo("")}
              aria-label="Remove video"
            >
              ✕
            </button>
          )}
        </div>
        {video.trim() && (
          <video className="admin-preview" src={video} controls preload="metadata" />
        )}

        <label className="admin-label">
          Stock quantity (optional — leave blank to use the toggle only; 0 =
          sold out)
        </label>
        <input
          className="admin-input"
          type="number"
          min={0}
          placeholder="e.g. 12"
          value={stockQty}
          onChange={(e) => setStockQty(e.target.value)}
        />

        <label className="admin-label">
          Sold count (displayed on product page — shows social proof)
        </label>
        <input
          className="admin-input"
          type="number"
          min={0}
          placeholder="e.g. 150"
          value={soldCount}
          onChange={(e) => setSoldCount(e.target.value)}
        />

        <div className="admin-form-checks">
          <label className="admin-check">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            Featured on home page
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
            />
            In stock
          </label>
        </div>

        <div className="admin-form-actions">
          <button className="admin-linkbtn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-rose admin-btn-sm"
            onClick={save}
            disabled={busy}
          >
            {busy ? "Saving…" : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoriesEditor({
  categories,
  onSaved,
}: {
  categories: Category[];
  onSaved: () => void;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="admin-cats">
      <div className="admin-head" style={{ marginTop: 40, marginBottom: 24 }}>
        <h2 className="admin-title admin-title-sm" style={{ margin: 0 }}>
          Categories
        </h2>
        <button
          className="btn-rose admin-btn-sm"
          onClick={() => setAdding(true)}
        >
          + Add Category
        </button>
      </div>

      {adding && (
        <div style={{ marginBottom: 24 }}>
          <CategoryCard
            category={null}
            onSaved={() => {
              setAdding(false);
              onSaved();
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      <div className="admin-cats-grid">
        {categories.map((c) => (
          <CategoryCard key={c.slug} category={c} onSaved={onSaved} />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  onSaved,
  onCancel,
}: {
  category: Category | null;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const isNew = category === null;
  const [name, setName] = useState(category?.name ?? "");
  const [tagline, setTagline] = useState(category?.tagline ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [sizeGuide, setSizeGuide] = useState(category?.sizeGuide ?? "");
  // Using 'order' property; need to cast to unknown/any since Category type might not officially have it, but db.ts expects it.
  const [order, setOrder] = useState<number | "">(
    (category as any)?.order ?? ""
  );
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      showToast("Name is required", false);
      return;
    }
    setBusy(true);
    try {
      const slug = isNew ? slugify(name) : category.slug;
      await setDoc(
        doc(db, "categories", slug),
        {
          name: name.trim(),
          tagline: tagline.trim(),
          image: image.trim(),
          sizeGuide: sizeGuide.trim(),
          order: order === "" ? 0 : Number(order),
        },
        { merge: true }
      );
      showToast(name + " saved 💖");
      onSaved();
    } catch {
      showToast("Save failed", false);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!category) return;
    if (!confirm(`Delete category "${category.name}"? This cannot be undone.`))
      return;
    setBusy(true);
    try {
      await deleteDoc(doc(db, "categories", category.slug));
      showToast("Deleted " + category.name);
      onSaved();
    } catch {
      showToast("Delete failed", false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-form-group">
      <label className="admin-label">Name</label>
      <input
        className="admin-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Summer Collection"
      />

      <label className="admin-label">Tagline</label>
      <input
        className="admin-input"
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        placeholder="Short description"
      />

      <label className="admin-label">Display Order (optional)</label>
      <input
        className="admin-input"
        type="number"
        value={order}
        onChange={(e) => setOrder(e.target.value ? Number(e.target.value) : "")}
        placeholder="e.g. 1 (lower numbers appear first)"
      />

      <label className="admin-label">Size Guide Image URL (optional)</label>
      <div className="admin-imgrow">
        <input
          className="admin-input"
          value={sizeGuide}
          onChange={(e) => setSizeGuide(e.target.value)}
          placeholder="Upload size guide chart..."
        />
        <UploadButton folder="categories" onDone={setSizeGuide} />
      </div>

      <label className="admin-label">Image URL</label>
      <div className="admin-imgrow">
        <input
          className="admin-input"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="/cat1.jpg or upload..."
        />
        <UploadButton folder="categories" onDone={setImage} />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          className="btn-rose admin-btn-sm"
          onClick={save}
          disabled={busy}
        >
          {busy ? "Saving…" : "Save"}
        </button>
        {isNew && onCancel && (
          <button
            className="admin-linkbtn"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
        )}
        {!isNew && (
          <button
            className="admin-linkbtn admin-danger"
            onClick={remove}
            disabled={busy}
            style={{ marginLeft: "auto" }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function SettingsPanel() {
  const [deliveryText, setDeliveryText] = useState("3–7 days across India");
  const [returnsText, setReturnsText] = useState("Easy 7-day returns");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "settings", "store")).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.deliveryText) setDeliveryText(data.deliveryText);
        if (data.returnsText) setReturnsText(data.returnsText);
      }
    });
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      await setDoc(doc(db, "settings", "store"), {
        deliveryText: deliveryText.trim(),
        returnsText: returnsText.trim(),
      }, { merge: true });
      showToast("Store settings updated 💖");
    } catch {
      showToast("Save failed", false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-card admin-narrow">
      <h2 className="admin-title admin-title-sm">Store Settings</h2>
      
      <label className="admin-label">Global Delivery Time Text</label>
      <input
        className="admin-input"
        value={deliveryText}
        onChange={(e) => setDeliveryText(e.target.value)}
        placeholder="e.g. 3-7 days across India"
      />

      <label className="admin-label" style={{ marginTop: 16 }}>Global Returns Policy Text</label>
      <input
        className="admin-input"
        value={returnsText}
        onChange={(e) => setReturnsText(e.target.value)}
        placeholder="e.g. Easy 7-day returns"
      />

      <button
        className="btn-rose admin-btn"
        onClick={save}
        disabled={busy}
        style={{ marginTop: 24 }}
      >
        {busy ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}

function AdminReviewsPanel({
  reviews,
  onChanged,
}: {
  reviews: Review[];
  onChanged: () => void;
}) {
  const removeReview = async (r: Review) => {
    if (!confirm(`Delete review "${r.title}" by ${r.userName}?`)) return;
    try {
      await deleteReview(r.id);
      showToast("Review deleted");
      onChanged();
    } catch {
      showToast("Delete failed", false);
    }
  };

  if (reviews.length === 0) {
    return (
      <p className="admin-loading">
        No reviews yet. When customers leave reviews on products, they&rsquo;ll
        appear here for moderation.
      </p>
    );
  }

  // Group by product
  const byProduct = new Map<string, Review[]>();
  for (const r of reviews) {
    const list = byProduct.get(r.productSlug) ?? [];
    list.push(r);
    byProduct.set(r.productSlug, list);
  }
  const groups = [...byProduct.entries()].sort(
    (a, b) => b[1].length - a[1].length
  );

  return (
    <div className="admin-table">
      {groups.map(([slug, group]) => (
        <div className="admin-card req-group" key={slug}>
          <p className="req-title">
            {slug}{" "}
            <span className="req-count">
              {group.length} review{group.length !== 1 ? "s" : ""}
            </span>
          </p>
          {group.map((r) => (
            <div className="req-row" key={r.id} style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#F5C518" }}>
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </span>
                <button
                  className="admin-linkbtn admin-danger"
                  onClick={() => removeReview(r)}
                >
                  Delete
                </button>
              </div>
              <p className="admin-row-name" style={{ fontSize: "0.88rem" }}>
                {r.title}
              </p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem" }}>
                {r.comment}
              </p>
              <p className="admin-row-meta">
                {r.userName} ·{" "}
                {new Date(r.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                {r.verified && " · ✓ Verified"}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function CouponsPanel({ coupons }: { coupons: Coupon[] }) {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [busy, setBusy] = useState(false);

  const addCoupon = async () => {
    const codeId = code.trim().toUpperCase();
    if (!codeId || !value) {
      showToast("Code and Value are required", false);
      return;
    }
    setBusy(true);
    try {
      const docRef = doc(db, "coupons", codeId);
      const exists = (await getDoc(docRef)).exists();
      if (exists) {
        showToast("Coupon code already exists", false);
        setBusy(false);
        return;
      }
      await setDoc(docRef, {
        discountType: type,
        discountValue: Number(value),
        minOrderValue: Number(minOrder || 0),
        active: true,
        createdAt: new Date().toISOString(),
      });
      showToast("Coupon created! 💖");
      setCode("");
      setValue("");
      setMinOrder("");
    } catch {
      showToast("Failed to create coupon", false);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (c: Coupon) => {
    try {
      await updateDoc(doc(db, "coupons", c.id), { active: !c.active });
      showToast(`Coupon ${c.id} ${!c.active ? "activated" : "deactivated"}`);
    } catch {
      showToast("Failed to update status", false);
    }
  };

  const removeCoupon = async (c: Coupon) => {
    if (!confirm(`Delete coupon ${c.id}?`)) return;
    try {
      await deleteDoc(doc(db, "coupons", c.id));
      showToast("Coupon deleted");
    } catch {
      showToast("Failed to delete", false);
    }
  };

  return (
    <div className="admin-grid2">
      <div className="admin-form-group">
        <h2 className="checkout-h2">Create Coupon</h2>
        <label className="admin-label">Coupon Code</label>
        <input className="admin-input" placeholder="e.g. FLAT500" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        
        <label className="admin-label">Discount Type</label>
        <select className="admin-input" value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed Amount (₹)</option>
        </select>
        
        <label className="admin-label">Discount Value</label>
        <input className="admin-input" type="number" placeholder={type === "percentage" ? "e.g. 10" : "e.g. 500"} value={value} onChange={(e) => setValue(e.target.value)} />
        
        <label className="admin-label">Minimum Order Value (optional)</label>
        <input className="admin-input" type="number" placeholder="e.g. 1999" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />

        <button className="btn-rose admin-btn" onClick={addCoupon} disabled={busy}>
          {busy ? "Creating…" : "Create Coupon"}
        </button>
      </div>

      <div className="admin-table" style={{ marginTop: 0 }}>
        {coupons.length === 0 ? (
          <p className="admin-loading">No coupons created yet.</p>
        ) : (
          coupons.map((c) => (
            <div className="admin-row" key={c.id}>
              <div className="admin-row-main">
                <p className="admin-row-name" style={{ color: c.active ? '#10b981' : 'rgba(255,255,255,0.4)' }}>
                  {c.id} {!c.active && "(Inactive)"}
                </p>
                <p className="admin-row-meta">
                  {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  {c.minOrderValue > 0 ? ` on orders above ₹${c.minOrderValue}` : ''}
                </p>
              </div>
              <div className="admin-row-toggles">
                <label className="admin-check" style={{ marginRight: 16 }}>
                  <input type="checkbox" checked={c.active} onChange={() => toggleActive(c)} /> Active
                </label>
                <button className="admin-linkbtn admin-danger" onClick={() => removeCoupon(c)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
