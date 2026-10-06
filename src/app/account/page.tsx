"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import {
  Address,
  fetchProfile,
  makeAddressId,
  resetPassword,
  saveAddresses,
  signInWithEmail,
  signInWithGoogle,
  signOutCustomer,
  signUpWithEmail,
  useAuthUser,
  sendOtp,
  setupRecaptcha,
} from "@/lib/customer";
import { Order, fetchOrdersForUser } from "@/lib/orders";
import { inr } from "@/lib/catalog";
import { showToast } from "@/lib/toast";
import AuthGate from "@/components/AuthGate";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Other",
];

export default function AccountPage() {
  const { user, ready } = useAuthUser();

  if (!ready) {
    return (
      <main className="page-main">
        <p className="admin-loading">Loading…</p>
      </main>
    );
  }

  if (!user) return (
    <main className="page-main">
      <AuthGate />
    </main>
  );

  return <Dashboard user={user} />;
}

function Dashboard({ user }: { user: User }) {
  const [tab, setTab] = useState<"profile" | "addresses" | "orders">("profile");

  return (
    <main className="page-main">
      <div className="admin-wrap">
        <div className="admin-head">
          <div>
            <p className="s-eyebrow">My Account</p>
            <h1 className="admin-title">
              {tab === "profile"
                ? "Profile"
                : tab === "addresses"
                  ? "Saved Addresses"
                  : "Order History"}
            </h1>
          </div>
          <button className="admin-linkbtn" onClick={signOutCustomer}>
            Sign out
          </button>
        </div>

        <div className="admin-tabs">
          <button
            className={`chip ${tab === "profile" ? "active" : ""}`}
            onClick={() => setTab("profile")}
          >
            Profile
          </button>
          <button
            className={`chip ${tab === "addresses" ? "active" : ""}`}
            onClick={() => setTab("addresses")}
          >
            Addresses
          </button>
          <button
            className={`chip ${tab === "orders" ? "active" : ""}`}
            onClick={() => setTab("orders")}
          >
            Orders
          </button>
        </div>

        {tab === "profile" && <ProfilePanel user={user} />}
        {tab === "addresses" && <AddressesPanel uid={user.uid} />}
        {tab === "orders" && <OrdersPanel uid={user.uid} />}
      </div>
    </main>
  );
}

function ProfilePanel({ user }: { user: User }) {
  return (
    <div className="admin-card admin-narrow" style={{ margin: "0" }}>
      <label className="admin-label">Name</label>
      <p className="order-line">{user.displayName || "—"}</p>
      <label className="admin-label">Email</label>
      <p className="order-line">{user.email}</p>
    </div>
  );
}

function AddressesPanel({ uid }: { uid: string }) {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [editing, setEditing] = useState<Address | "new" | null>(null);

  const load = async () => {
    const profile = await fetchProfile(uid);
    setAddresses(profile?.addresses ?? []);
  };

  useEffect(() => {
    load();
  }, [uid]);

  const persist = async (next: Address[]) => {
    setAddresses(next);
    await saveAddresses(uid, next);
  };

  const remove = async (id: string) => {
    if (!addresses) return;
    if (!confirm("Delete this address?")) return;
    await persist(addresses.filter((a) => a.id !== id));
    showToast("Address deleted");
  };

  const setDefault = async (id: string) => {
    if (!addresses) return;
    await persist(
      addresses.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  if (addresses === null)
    return <p className="admin-loading">Loading addresses…</p>;

  return (
    <div>
      <div className="admin-head-actions" style={{ marginBottom: 20 }}>
        <button className="btn-rose admin-btn-sm" onClick={() => setEditing("new")}>
          + Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <p className="admin-loading">
          No saved addresses yet — add one, or save one automatically at
          checkout.
        </p>
      ) : (
        <div className="admin-table">
          {addresses.map((a) => (
            <div className="admin-card" key={a.id}>
              <p className="admin-row-name">
                {a.label || "Address"}
                {a.isDefault && <span className="admin-count"> · Default</span>}
              </p>
              <p className="order-line">{a.name} · {a.phone}</p>
              <p className="order-line">
                {a.address}, {a.city}, {a.state} {a.pincode}
              </p>
              <div className="admin-form-actions" style={{ marginTop: 14 }}>
                {!a.isDefault && (
                  <button className="admin-linkbtn" onClick={() => setDefault(a.id)}>
                    Make default
                  </button>
                )}
                <button className="admin-linkbtn" onClick={() => setEditing(a)}>
                  Edit
                </button>
                <button
                  className="admin-linkbtn admin-danger"
                  onClick={() => remove(a.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <AddressForm
          address={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (addr) => {
            const current = addresses ?? [];
            const isFirst = current.length === 0;
            const next =
              editing === "new"
                ? [...current, { ...addr, isDefault: isFirst || addr.isDefault }]
                : current.map((a) => (a.id === addr.id ? addr : a));
            await persist(
              addr.isDefault
                ? next.map((a) => ({ ...a, isDefault: a.id === addr.id }))
                : next
            );
            setEditing(null);
            showToast("Address saved 💖");
          }}
        />
      )}
    </div>
  );
}

function AddressForm({
  address,
  onClose,
  onSave,
}: {
  address: Address | null;
  onClose: () => void;
  onSave: (address: Address) => void;
}) {
  const [label, setLabel] = useState(address?.label ?? "Home");
  const [name, setName] = useState(address?.name ?? "");
  const [phone, setPhone] = useState(address?.phone ?? "");
  const [addr, setAddr] = useState(address?.address ?? "");
  const [city, setCity] = useState(address?.city ?? "");
  const [state, setState] = useState(address?.state ?? "Delhi");
  const [pincode, setPincode] = useState(address?.pincode ?? "");
  const [isDefault, setIsDefault] = useState(!!address?.isDefault);

  const save = () => {
    if (name.trim().length < 2) return showToast("Please enter a name", false);
    if (!/^[6-9]\d{9}$/.test(phone.trim()))
      return showToast("Please enter a valid 10-digit mobile number", false);
    if (addr.trim().length < 6) return showToast("Please enter the full address", false);
    if (city.trim().length < 2) return showToast("Please enter a city", false);
    if (!/^\d{6}$/.test(pincode.trim()))
      return showToast("Please enter a valid 6-digit PIN code", false);

    onSave({
      id: address?.id ?? makeAddressId(),
      label: label.trim() || "Address",
      name: name.trim(),
      phone: phone.trim(),
      address: addr.trim(),
      city: city.trim(),
      state,
      pincode: pincode.trim(),
      isDefault,
    });
  };

  return (
    <div className="admin-modal">
      <div className="admin-card admin-form">
        <h2 className="admin-title">
          {address ? "Edit Address" : "New Address"}
        </h2>

        <label className="admin-label">Label (Home, Work, etc.)</label>
        <input className="admin-input" value={label} onChange={(e) => setLabel(e.target.value)} />

        <label className="admin-label">Full name *</label>
        <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="admin-label">Mobile number *</label>
        <input
          className="admin-input"
          type="tel"
          inputMode="numeric"
          placeholder="10-digit mobile"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
        />

        <label className="admin-label">Address (house, street, area) *</label>
        <textarea
          className="admin-input admin-textarea"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
        />

        <div className="admin-grid2">
          <div>
            <label className="admin-label">City *</label>
            <input className="admin-input" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label className="admin-label">PIN code *</label>
            <input
              className="admin-input"
              inputMode="numeric"
              placeholder="6 digits"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>
        </div>

        <label className="admin-label">State *</label>
        <select className="admin-input" value={state} onChange={(e) => setState(e.target.value)}>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <label className="admin-check" style={{ marginTop: 16 }}>
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          Make this my default address
        </label>

        <div className="admin-form-actions">
          <button className="admin-linkbtn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-rose admin-btn-sm" onClick={save}>
            Save Address
          </button>
        </div>
      </div>
    </div>
  );
}

function OrdersPanel({ uid }: { uid: string }) {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    fetchOrdersForUser(uid).then(setOrders);
  }, [uid]);

  if (orders === null) return <p className="admin-loading">Loading orders…</p>;

  if (orders.length === 0)
    return (
      <p className="admin-loading">
        No orders yet — your past orders will appear here once you check out.
      </p>
    );

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
                · <strong>{inr(o.total)}</strong>
              </p>
            </div>
            <span className={`admin-input order-status st-${o.status}`}>
              {o.status}
            </span>
          </div>
          <div className="order-body">
            <div>
              <p className="admin-label">Delivery to</p>
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
