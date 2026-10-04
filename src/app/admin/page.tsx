"use client";

import { useEffect, useState } from "react";
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
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage, firebaseConfig } from "@/lib/firebase";
import { Category, Product, CategorySlug, inr } from "@/lib/catalog";
import { Order, ORDER_STATUSES, OrderStatus } from "@/lib/orders";
import { showToast } from "@/lib/toast";

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
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, "admins", u.uid));
          setIsAdmin(snap.exists());
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(null);
      }
      setAuthReady(true);
    });
  }, []);

  if (!authReady || (user && isAdmin === null)) {
    return (
      <main className="page-main">
        <p className="admin-loading">Loading…</p>
      </main>
    );
  }

  if (!user) return <Login />;

  if (!isAdmin) {
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

  return <Dashboard currentUser={user} onSignOut={() => signOut(auth)} />;
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
  onSignOut,
}: {
  currentUser: User;
  onSignOut: () => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [tab, setTab] = useState<
    "products" | "orders" | "requests" | "admins" | "settings"
  >("products");
  const [editing, setEditing] = useState<EditTarget>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [pSnap, cSnap, oSnap, rSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "stockRequests")),
      ]);
      setRequests(
        rSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as StockRequest)
          .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      );
      setOrders(
        oSnap.docs
          .map((d) => d.data() as Order)
          .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      );
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
      showToast("Failed to load data", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "products", p.slug));
      showToast("Deleted " + p.name);
      load();
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
    <main className="page-main">
      <div className="admin-wrap">
        <div className="admin-head">
          <div>
            <p className="s-eyebrow">TheNiceLamps Admin</p>
            <h1 className="admin-title">
              {tab === "products"
                ? "Products"
                : tab === "orders"
                  ? "Orders"
                  : tab === "requests"
                    ? "Stock Requests"
                    : "Admins"}
            </h1>
          </div>
          <div className="admin-head-actions">
            {tab === "products" && (
              <button
                className="btn-rose admin-btn-sm"
                onClick={() => setEditing("new")}
              >
                + Add Product
              </button>
            )}
            <button className="admin-linkbtn" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={`chip ${tab === "products" ? "active" : ""}`}
            onClick={() => setTab("products")}
          >
            Products ({products.length})
          </button>
          <button
            className={`chip ${tab === "orders" ? "active" : ""}`}
            onClick={() => setTab("orders")}
          >
            Orders ({orders.length})
          </button>
          <button
            className={`chip ${tab === "requests" ? "active" : ""}`}
            onClick={() => setTab("requests")}
          >
            Requests ({requests.length})
          </button>
          <button
            className={`chip ${tab === "admins" ? "active" : ""}`}
            onClick={() => setTab("admins")}
          >
            Admins
          </button>
          <button
            className={`chip ${tab === "settings" ? "active" : ""}`}
            onClick={() => setTab("settings")}
          >
            Settings
          </button>
        </div>

        {tab === "settings" ? (
          <SettingsPanel />
        ) : tab === "admins" ? (
          <AdminsPanel currentUser={currentUser} />
        ) : tab === "requests" ? (
          loading ? (
            <p className="admin-loading">Loading requests…</p>
          ) : (
            <RequestsPanel requests={requests} onChanged={load} />
          )
        ) : tab === "orders" ? (
          loading ? (
            <p className="admin-loading">Loading orders…</p>
          ) : (
            <OrdersPanel orders={orders} onChanged={load} />
          )
        ) : loading ? (
          <p className="admin-loading">Loading products…</p>
        ) : (
          <div className="admin-table">
            {products.map((p) => (
              <div className="admin-row" key={p.slug}>
                <img className="admin-thumb" src={p.images[0]} alt={p.name} />
                <div className="admin-row-main">
                  <p className="admin-row-name">{p.name}</p>
                  <p className="admin-row-meta">
                    {categories.find((c) => c.slug === p.category)?.name ??
                      p.category}{" "}
                    · {inr(p.price)}{" "}
                    <s style={{ opacity: 0.5 }}>{inr(p.mrp)}</s>
                  </p>
                </div>
                <div className="admin-row-toggles">
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={!!p.featured}
                      onChange={(e) =>
                        quickToggle(p, "featured", e.target.checked)
                      }
                    />
                    Featured
                  </label>
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={p.inStock !== false}
                      onChange={(e) =>
                        quickToggle(p, "inStock", e.target.checked)
                      }
                    />
                    In stock
                  </label>
                  <QtyCell product={p} onSave={quickSetQty} />
                </div>
                <div className="admin-row-actions">
                  <button
                    className="admin-linkbtn"
                    onClick={() => setEditing(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-linkbtn admin-danger"
                    onClick={() => remove(p)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "products" && (
          <CategoriesEditor categories={categories} onSaved={load} />
        )}

        {editing && (
          <ProductForm
            key={editing === "new" ? "new" : editing.slug}
            product={editing === "new" ? null : editing}
            categories={categories}
            nextSortOrder={products.length}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        )}
      </div>
    </main>
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
  const setStatus = async (o: Order, status: OrderStatus) => {
    try {
      await setDoc(doc(db, "orders", o.id), { status }, { merge: true });
      showToast(`${o.id} → ${status}`);
      onChanged();
    } catch {
      showToast("Status update failed", false);
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
        showToast(
          "This email already has an account — ask Claude to link it as admin",
          false
        );
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
          {admins.map((a) => (
            <div className="admin-row" key={a.uid} style={{ gridTemplateColumns: "1fr auto" }}>
              <div className="admin-row-main">
                <p className="admin-row-name">
                  {a.email}
                  {a.uid === currentUser.uid && (
                    <span className="admin-count"> (you)</span>
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
                {a.uid !== currentUser.uid && (
                  <button
                    className="admin-linkbtn admin-danger"
                    onClick={() => removeAdmin(a)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
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
    (product?.sizes ?? ["XS", "S", "M", "L", "XL", "XXL"]).join(", ")
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
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const priceN = Number(price);
    const mrpN = Number(mrp || price);
    const cleanImages = images.map((x) => x.trim()).filter(Boolean);
    if (!name.trim() || !priceN || cleanImages.length === 0) {
      showToast("Name, price and at least one photo are required", false);
      return;
    }
    const slug = product?.slug ?? slugify(name);
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
            <label className="admin-label">Fabric</label>
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
    <div className="admin-card">
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
