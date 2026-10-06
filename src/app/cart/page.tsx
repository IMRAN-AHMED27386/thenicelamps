"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { inr } from "@/lib/catalog";

import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { showToast } from "@/lib/toast";

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, mrpTotal, savings, coupon, couponDiscount, setCoupon, updateQty, removeItem, clear: clearCart } = useCart();
  const { addItem: addWishlist } = useWishlist();
  const [couponInput, setCouponInput] = useState("");
  const [applying, setApplying] = useState(false);

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setApplying(true);
    try {
      const snap = await getDoc(doc(db, "coupons", code));
      if (!snap.exists()) {
        showToast("Invalid coupon code", false);
        setCoupon(null);
        return;
      }
      const data = snap.data();
      if (!data.active) {
        showToast("This coupon is no longer active", false);
        setCoupon(null);
        return;
      }
      if (subtotal < (data.minOrderValue || 0)) {
        showToast(`Minimum order value for this coupon is ${inr(data.minOrderValue)}`, false);
        setCoupon(null);
        return;
      }
      setCoupon({ id: snap.id, code: snap.id, ...data } as any);
      showToast("Coupon applied! 💖");
      setCouponInput("");
    } catch {
      showToast("Failed to apply coupon", false);
    } finally {
      setApplying(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    showToast("Coupon removed");
  };

  const moveToWishlist = (item: any) => {
    addWishlist({
      slug: item.slug,
      name: item.name,
      price: item.price,
      mrp: item.mrp,
      image: item.image,
    });
    removeItem(item.slug, item.size);
    showToast("Moved to wishlist 💖");
  };

  const finalTotal = subtotal - couponDiscount;
  const itemCount = items.reduce((acc, i) => acc + i.qty, 0);

  return (
    <main className="page-main">
      <div className="cart-wrap">
        
        <div className="cart-top-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </span>
            Back
          </button>
          
          <div style={{ textAlign: "center" }}>
            <p className="s-eyebrow" style={{ marginBottom: 4, letterSpacing: "0.2em", fontSize: "0.75rem", color: "#f43f5e" }}>YOUR SELECTION</p>
            <h1 className="cart-title" style={{ fontFamily: "var(--font-serif)", fontSize: "2.6rem", fontWeight: 400, margin: 0 }}>
              Shopping <em style={{ fontStyle: "italic", color: "#f43f5e" }}>Cart</em>
            </h1>
          </div>
          
          <Link href="/shop" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', textDecoration: 'underline', fontSize: '0.9rem' }}>
            Continue Shopping
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty — let&rsquo;s fix that.</p>
            <Link href="/shop" className="btn-rose">
              <span className="btn-ico">✦</span> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-grid">
            
            {/* Left Column */}
            <div>
              <div style={{ background: "var(--grad-card)", border: "var(--border-glass)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 500 }}>
                    {itemCount} Item{itemCount !== 1 ? "s" : ""} in your cart
                  </h2>
                  <button onClick={clearCart} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", cursor: "pointer" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Clear Cart
                  </button>
                </div>

                <div className="cart-items">
                  {items.map((item) => {
                    const discountPercent = item.mrp && item.mrp > item.price 
                      ? Math.round(((item.mrp - item.price) / item.mrp) * 100) 
                      : 0;

                    return (
                      <div className="cart-row" key={`${item.slug}-${item.size}`} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', marginBottom: '16px' }}>
                        <Link href={`/product/${item.slug}`} className="cart-thumb" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Link>
                        
                        <div className="cart-detail" style={{ alignSelf: "start", paddingTop: '4px' }}>
                          <Link href={`/product/${item.slug}`} className="cart-name" style={{ fontSize: "1.1rem", color: 'white', textDecoration: 'none' }}>
                            {item.name}
                          </Link>
                          <p className="cart-size" style={{ marginBottom: 12, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>SIZE: {item.size}</p>
                          <p className="cart-price" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                            {inr(item.price)}{" "}
                            {item.mrp && item.mrp > item.price && (
                              <s style={{ opacity: 0.5, fontSize: "0.85em", marginLeft: 6, color: "rgba(255,255,255,0.8)" }}>
                                {inr(item.mrp)}
                              </s>
                            )}
                            {discountPercent > 0 && (
                              <span className="discount-badge" style={{ background: 'rgba(212,175,55,0.1)', color: '#e6c565', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(212,175,55,0.2)', marginLeft: '12px', verticalAlign: 'middle', fontWeight: 600 }}>
                                {discountPercent}% OFF
                              </span>
                            )}
                          </p>
                          
                          <div className="cart-item-actions" style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
                            <button onClick={() => moveToWishlist(item)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                              </svg>
                              Move to Wishlist
                            </button>
                            <button onClick={() => removeItem(item.slug, item.size)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              Remove
                            </button>
                          </div>
                        </div>
                        
                        <div className="cart-actions" style={{ alignSelf: "center" }}>
                          <div className="qty-row" style={{ display: 'flex', alignItems: 'center', border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, background: "rgba(255,255,255,0.02)", width: 'fit-content' }}>
                            <button
                              className="qty-btn"
                              style={{ width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: "transparent", border: "none", color: "white", cursor: 'pointer' }}
                              onClick={() =>
                                updateQty(item.slug, item.size, item.qty - 1)
                              }
                            >
                              −
                            </button>
                            <span className="qty-val" style={{ width: '24px', textAlign: 'center', border: "none", background: "transparent", fontWeight: 600, fontSize: '0.9rem' }}>{item.qty}</span>
                            <button
                              className="qty-btn"
                              style={{ width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: "transparent", border: "none", color: "white", cursor: 'pointer' }}
                              onClick={() =>
                                updateQty(item.slug, item.size, item.qty + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="trust-badges" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px' }}>
                <div className="trust-badge" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px", color: "var(--white)", marginTop: 0 }}>Secure Delivery</h4>
                    <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4, margin: 0 }}>Only available in Delhi, Haryana, Punjab &amp; Uttar Pradesh</p>
                  </div>
                </div>
                <div className="trust-badge" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <polyline points="9 12 11 14 15 10"></polyline>
                  </svg>
                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px", color: "var(--white)", marginTop: 0 }}>100% Secure Payment</h4>
                    <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4, margin: 0 }}>Your transactions are safe with us</p>
                  </div>
                </div>
                <div className="trust-badge" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px", color: "var(--white)", marginTop: 0 }}>Easy Returns</h4>
                    <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4, margin: 0 }}>Hassle-free within 7 days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="cart-summary" style={{ borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
                <h2 style={{ fontSize: "1.4rem", margin: 0 }}>Order Summary</h2>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>{itemCount} Item{itemCount !== 1 ? "s" : ""}</span>
              </div>
              
              <div className="sum-row">
                <span>Total MRP</span>
                <span style={savings > 0 ? { textDecoration: "line-through", opacity: 0.6 } : {}}>{inr(mrpTotal)}</span>
              </div>
              {savings > 0 && (
                <div className="sum-row" style={{ color: "#10b981" }}>
                  <span>Discount on MRP</span>
                  <span>− {inr(mrpTotal - subtotal)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="sum-row" style={{ color: "#10b981" }}>
                  <span>Coupon Discount</span>
                  <span>− {inr(couponDiscount)}</span>
                </div>
              )}

              <div className="sum-divider" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", margin: "16px 0" }} />

              <div className="sum-row">
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: "var(--white)" }}>{inr(subtotal - couponDiscount)}</span>
              </div>

              <div className="sum-row">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Delivery
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
                <span style={{ fontSize: '0.85em', opacity: 0.8 }}>Calculated at checkout</span>
              </div>

              <div className="sum-divider" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", margin: "16px 0" }} />

              <div className="sum-row sum-total" style={{ borderTop: "none", paddingTop: 0, marginTop: 0, fontSize: "1.1rem" }}>
                <span>Total Amount</span>
                <span>{inr(finalTotal)}</span>
              </div>
              
              {savings > 0 && (
                <div style={{ textAlign: "right", color: "#10b981", fontSize: "0.85rem", marginBottom: "8px", fontWeight: 500 }}>
                  You will save {inr(savings)} on this order
                </div>
              )}

              <div style={{ textAlign: "right", fontSize: "0.75rem", opacity: 0.6 }}>
                (Inclusive of all taxes &amp; GST)
              </div>

              {/* Coupon Box */}
              <div className="coupon-input-box" style={{ display: 'flex', gap: '12px', margin: '24px 0' }}>
                {coupon ? (
                  <div className="applied-coupon" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '8px', border: '1px dashed #10b981' }}>
                    <div>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{coupon.code}</span> applied!
                    </div>
                    <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: '0.85rem', padding: 0, cursor: 'pointer' }}>Remove</button>
                  </div>
                ) : (
                  <>
                    <div className="input-wrap" style={{ position: 'relative', flex: 1 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
                        <polyline points="20 12 20 22 4 22 4 12"></polyline>
                        <rect x="2" y="7" width="20" height="5"></rect>
                        <line x1="12" y1="22" x2="12" y2="7"></line>
                        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                      </svg>
                      <input 
                        type="text" 
                        placeholder="Enter coupon code" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '14px 14px 14px 44px', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                    <button onClick={applyCoupon} disabled={applying} style={{ background: 'linear-gradient(to right, #f43f5e, #fda4af)', color: 'white', border: 'none', borderRadius: '8px', padding: '0 24px', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em', cursor: applying ? 'not-allowed' : 'pointer' }}>
                      {applying ? "..." : "APPLY"}
                    </button>
                  </>
                )}
              </div>

              <Link href="/checkout" className="cart-btn-lock" style={{ textDecoration: 'none', background: 'var(--grad-main)', border: 'none', borderRadius: '8px', width: '100%', padding: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', color: 'white', fontWeight: 600, fontSize: '0.95rem', letterSpacing: '0.05em' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                PROCEED TO CHECKOUT →
              </Link>
              

            </div>
          </div>
        )}
      </div>
    </main>
  );
}
