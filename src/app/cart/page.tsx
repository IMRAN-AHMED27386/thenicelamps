"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { inr } from "@/lib/catalog";

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCart();

  return (
    <main className="page-main">
      <div className="cart-wrap">
        <div className="page-head">
          <p className="s-eyebrow">Your Selection</p>
          <h1 className="s-title">
            Shopping <em>Cart</em>
          </h1>
          <div className="s-divider"></div>
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
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-row" key={`${item.slug}-${item.size}`}>
                  <Link href={`/product/${item.slug}`} className="cart-thumb">
                    <img src={item.image} alt={item.name} />
                  </Link>
                  <div className="cart-detail">
                    <Link href={`/product/${item.slug}`} className="cart-name">
                      {item.name}
                    </Link>
                    <p className="cart-size">Size: {item.size}</p>
                    <p className="cart-price">{inr(item.price)}</p>
                  </div>
                  <div className="cart-actions">
                    <div className="qty-row">
                      <button
                        className="qty-btn"
                        onClick={() =>
                          updateQty(item.slug, item.size, item.qty - 1)
                        }
                      >
                        −
                      </button>
                      <span className="qty-val">{item.qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() =>
                          updateQty(item.slug, item.size, item.qty + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="cart-remove"
                      onClick={() => removeItem(item.slug, item.size)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="sum-row">
                <span>Subtotal</span>
                <span>{inr(subtotal)}</span>
              </div>
              <div className="sum-row">
                <span>Delivery</span>
                <span>{subtotal >= 1999 ? "Free" : inr(99)}</span>
              </div>
              <div className="sum-row sum-total">
                <span>Total</span>
                <span>{inr(subtotal + (subtotal >= 1999 ? 0 : 99))}</span>
              </div>
              <Link href="/checkout" className="btn-rose sum-btn">
                <span className="btn-ico">✦</span> Proceed to Checkout
              </Link>
              <p className="sum-note">
                Cash on Delivery available now — UPI &amp; cards coming soon.
                Free delivery on orders over {inr(1999)}.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
