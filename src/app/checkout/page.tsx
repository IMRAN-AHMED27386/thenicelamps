"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { inr } from "@/lib/catalog";
import { placeOrder, Order, OrderCustomer } from "@/lib/orders";
import { showToast } from "@/lib/toast";
import {
  Address,
  fetchProfile,
  makeAddressId,
  saveAddresses,
  useAuthUser,
} from "@/lib/customer";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Other",
];

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const delivery = subtotal >= 1999 ? 0 : 99;
  const { user } = useAuthUser();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Delhi");
  const [pincode, setPincode] = useState("");
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [saveAddress, setSaveAddress] = useState(true);

  const applyAddress = (a: Address) => {
    setName(a.name);
    setPhone(a.phone);
    setAddress(a.address);
    setCity(a.city);
    setState(a.state);
    setPincode(a.pincode);
  };

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.uid).then((profile) => {
      setEmail(user.email ?? "");
      const addrs = profile?.addresses ?? [];
      setSavedAddresses(addrs);
      const def = addrs.find((a) => a.isDefault) ?? addrs[0];
      if (def) applyAddress(def);
      else if (profile?.name) setName(profile.name);
    });
  }, [user]);

  const submit = async () => {
    if (name.trim().length < 2) return showToast("Please enter your full name", false);
    if (!/^[6-9]\d{9}$/.test(phone.trim()))
      return showToast("Please enter a valid 10-digit Indian mobile number", false);
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return showToast("Please enter a valid email (or leave it empty)", false);
    if (address.trim().length < 6) return showToast("Please enter your full address", false);
    if (city.trim().length < 2) return showToast("Please enter your city", false);
    if (!/^\d{6}$/.test(pincode.trim()))
      return showToast("Please enter a valid 6-digit PIN code", false);

    const customer: OrderCustomer = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      state,
      pincode: pincode.trim(),
    };

    setBusy(true);
    try {
      const order = await placeOrder(
        customer,
        items,
        subtotal,
        delivery,
        user?.uid
      );

      if (user && saveAddress) {
        const matches = (a: Address) =>
          a.name === customer.name &&
          a.phone === customer.phone &&
          a.address === customer.address &&
          a.city === customer.city &&
          a.state === customer.state &&
          a.pincode === customer.pincode;
        if (!savedAddresses.some(matches)) {
          const next = [
            ...savedAddresses.map((a) => ({ ...a, isDefault: false })),
            {
              id: makeAddressId(),
              label: "Home",
              name: customer.name,
              phone: customer.phone,
              address: customer.address,
              city: customer.city,
              state: customer.state,
              pincode: customer.pincode,
              isDefault: true,
            },
          ];
          saveAddresses(user.uid, next).catch(() => {});
        }
      }

      clear();
      setPlaced(order);
      window.scrollTo({ top: 0 });
    } catch {
      showToast("Could not place the order — please try again", false);
    } finally {
      setBusy(false);
    }
  };

  if (placed) {
    return (
      <main className="page-main">
        <div className="checkout-wrap">
          <div className="admin-card order-done rv in">
            <div className="order-done-ico">✦</div>
            <h1 className="admin-title">Order Placed!</h1>
            <p className="order-done-id">
              Order number: <strong>{placed.id}</strong>
            </p>
            <p className="admin-sub">
              Thank you, {placed.customer.name}! We&rsquo;ll call you on{" "}
              {placed.customer.phone} to confirm your Cash on Delivery order of{" "}
              <strong>{inr(placed.total)}</strong>.
            </p>
            <div className="order-done-actions">
              <Link href="/shop" className="btn-rose admin-btn-sm">
                Continue Shopping
              </Link>
              <a
                className="admin-linkbtn"
                target="_blank"
                rel="noopener"
                href={`https://wa.me/919650363038?text=${encodeURIComponent(
                  `Hi TheNiceLamps! I just placed order ${placed.id}.`
                )}`}
              >
                Questions? WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="page-main">
        <div className="cart-empty">
          <p>Your cart is empty — nothing to check out yet.</p>
          <Link href="/shop" className="btn-rose">
            <span className="btn-ico">✦</span> Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-main">
      <div className="checkout-wrap">
        <div className="page-head">
          <p className="s-eyebrow">Almost Yours</p>
          <h1 className="s-title">
            Check<em>out</em>
          </h1>
          <div className="s-divider"></div>
        </div>

        <div className="checkout-grid">
          <div className="admin-card">
            <h2 className="checkout-h2">Delivery Details</h2>

            {savedAddresses.length > 0 && (
              <>
                <label className="admin-label">Use a saved address</label>
                <select
                  className="admin-input"
                  defaultValue=""
                  onChange={(e) => {
                    const a = savedAddresses.find((x) => x.id === e.target.value);
                    if (a) applyAddress(a);
                  }}
                >
                  <option value="" disabled>
                    Choose a saved address…
                  </option>
                  {savedAddresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label} — {a.name}, {a.city}
                    </option>
                  ))}
                </select>
              </>
            )}

            <label className="admin-label">Full name *</label>
            <input className="admin-input" value={name}
              onChange={(e) => setName(e.target.value)} />

            <div className="admin-grid2">
              <div>
                <label className="admin-label">Mobile number *</label>
                <input className="admin-input" type="tel" inputMode="numeric"
                  placeholder="10-digit mobile" value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} />
              </div>
              <div>
                <label className="admin-label">Email (optional)</label>
                <input className="admin-input" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <label className="admin-label">Address (house, street, area) *</label>
            <textarea className="admin-input admin-textarea" value={address}
              onChange={(e) => setAddress(e.target.value)} />

            <div className="admin-grid2">
              <div>
                <label className="admin-label">City *</label>
                <input className="admin-input" value={city}
                  onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <label className="admin-label">PIN code *</label>
                <input className="admin-input" inputMode="numeric" placeholder="6 digits"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
              </div>
            </div>

            <label className="admin-label">State *</label>
            <select className="admin-input" value={state}
              onChange={(e) => setState(e.target.value)}>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {user && (
              <label className="admin-check" style={{ marginTop: 16 }}>
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                />
                Save this address to my account
              </label>
            )}

            <h2 className="checkout-h2" style={{ marginTop: 30 }}>Payment</h2>
            <label className="pay-option pay-active">
              <input type="radio" checked readOnly name="pay" />
              <span>
                <strong>Cash on Delivery</strong>
                <small>Pay when your order arrives</small>
              </span>
            </label>
            <label className="pay-option pay-disabled">
              <input type="radio" disabled name="pay" />
              <span>
                <strong>UPI / Card / Netbanking</strong>
                <small>Coming very soon</small>
              </span>
            </label>
          </div>

          <div className="cart-summary">
            <h2>Your Order</h2>
            {items.map((i) => (
              <div className="sum-row" key={`${i.slug}-${i.size}`}>
                <span>
                  {i.qty} × {i.name} ({i.size})
                </span>
                <span>{inr(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="sum-row" style={{ borderTop: "1px solid rgba(255,255,255,0.12)", marginTop: 8, paddingTop: 14 }}>
              <span>Subtotal</span>
              <span>{inr(subtotal)}</span>
            </div>
            <div className="sum-row">
              <span>Delivery</span>
              <span>{delivery === 0 ? "Free" : inr(delivery)}</span>
            </div>
            <div className="sum-row sum-total">
              <span>Total (COD)</span>
              <span>{inr(subtotal + delivery)}</span>
            </div>
            <button
              className="btn-rose sum-btn"
              style={{ opacity: busy ? 0.6 : 1, cursor: busy ? "wait" : "pointer" }}
              disabled={busy}
              onClick={submit}
            >
              <span className="btn-ico">✦</span>{" "}
              {busy ? "Placing Order…" : "Place Order"}
            </button>
            <p className="sum-note">
              By placing this order you agree to pay {inr(subtotal + delivery)}{" "}
              in cash when your order is delivered.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
