"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { inr } from "@/lib/catalog";
import { showToast } from "@/lib/toast";

export default function WishlistPage() {
  const { items, removeItem, clear } = useWishlist();
  const { addItem } = useCart();

  const moveToCart = (item: any) => {
    addItem({
      slug: item.slug,
      size: "M", // default size, they can change it in cart if needed
      name: item.name,
      price: item.price,
      mrp: item.mrp,
      image: item.image,
    });
    removeItem(item.slug);
    showToast("Moved to cart 💖");
  };

  return (
    <main className="page-main">
      <div className="cart-wrap">
        <div className="page-head">
          <p className="s-eyebrow">Your Favorites</p>
          <h1 className="s-title">
            My <em>Wishlist</em>
          </h1>
          <div className="s-divider"></div>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your wishlist is empty — start saving your favorites.</p>
            <Link href="/shop" className="btn-rose">
              <span className="btn-ico">✦</span> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-items">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 500 }}>
                  {items.length} Item{items.length !== 1 ? "s" : ""} saved
                </h2>
                <button
                  className="cart-remove"
                  onClick={clear}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Clear Wishlist
                </button>
              </div>

              {items.map((item) => (
                <div className="cart-row" key={item.slug}>
                  <Link href={`/product/${item.slug}`} className="cart-thumb">
                    <img src={item.image} alt={item.name} />
                  </Link>
                  <div className="cart-detail">
                    <Link href={`/product/${item.slug}`} className="cart-name">
                      {item.name}
                    </Link>
                    <p className="cart-price" style={{ marginTop: 8 }}>
                      {inr(item.price)}{" "}
                      {item.mrp && item.mrp > item.price && (
                        <s style={{ opacity: 0.5, fontSize: "0.85em", marginLeft: 6 }}>
                          {inr(item.mrp)}
                        </s>
                      )}
                    </p>
                    <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                      <button
                        className="cart-remove"
                        onClick={() => moveToCart(item)}
                        style={{ color: "#10b981", display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 7h12l-1.2 12.1a1.8 1.8 0 0 1-1.8 1.6H9a1.8 1.8 0 0 1-1.8-1.6L6 7Z" />
                          <path d="M9 9V6a3 3 0 0 1 6 0v3" />
                        </svg>
                        Move to Cart
                      </button>
                      <button
                        className="cart-remove"
                        onClick={() => removeItem(item.slug)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty right column just for layout balance */}
            <div className="cart-summary" style={{ opacity: 0, pointerEvents: 'none' }}></div>
          </div>
        )}
      </div>
    </main>
  );
}
