"use client";

import { useEffect, useRef, useState } from "react";
import { Product, SIZES, isOutOfStock } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { showToast } from "@/lib/toast";
import SizeGuide from "@/components/SizeGuide";
import NotifyMe from "@/components/NotifyMe";

export default function AddToCart({ product, sizeGuideImg }: { product: Product, sizeGuideImg?: string }) {
  const sizes = product.sizes?.length ? product.sizes : SIZES;
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { addItem: addWishlist, hasItem, removeItem } = useWishlist();

  const outOfStock = isOutOfStock(product);
  const tracked = typeof product.stockQty === "number";
  const maxQty = tracked
    ? Math.max(1, Math.min(10, product.stockQty as number))
    : 10;
  const lowStock =
    !outOfStock && tracked && (product.stockQty as number) <= 5;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const add = () => {
    if (outOfStock) return;
    if (!size) {
      showToast("Please select a size first", false);
      setOpen(true);
      return;
    }
    addItem(
      {
        slug: product.slug,
        size,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        image: product.images[0],
      },
      qty
    );
    showToast(`Added to cart — ${product.name} (${size}) 💖`, true, {
      label: "View Cart",
      href: "/cart",
    });
  };

  return (
    <div className="atc">
      <div className="atc-row" style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', marginBottom: '26px' }}>
        {/* Column 1: Size */}
        <div className="atc-field" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="atc-field-head" style={{ height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="atc-label" style={{ marginBottom: 0 }}>Size</span>
            <button
              type="button"
              className="size-guide-link"
              onClick={() => setGuideOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'block' }}>
                <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0zM14.5 12.5l-3-3M11.5 9.5l-3-3M17.5 15.5l-3-3"/>
              </svg>
              Size guide
            </button>
          </div>
          <div className="size-dd" ref={ddRef}>
            <button
              type="button"
              className={`size-dd-toggle ${open ? "open" : ""}`}
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <span className={size ? "" : "size-dd-placeholder"}>
                {size ?? "Select size"}
              </span>
              <span className="size-dd-caret">⌄</span>
            </button>
            {open && (
              <ul className="size-dd-menu" role="listbox">
                {sizes.map((s) => (
                  <li key={s} role="option" aria-selected={size === s}>
                    <button
                      type="button"
                      className={`size-dd-opt ${size === s ? "active" : ""}`}
                      onClick={() => {
                        setSize(s);
                        setOpen(false);
                      }}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Column 2: Quantity */}
        <div className="atc-field" style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column' }}>
          <div className="atc-field-head" style={{ height: '24px', display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span className="atc-label" style={{ marginBottom: 0 }}>Quantity</span>
          </div>
          <div className="qty-row">
            <button
              className="qty-btn"
              onClick={() => setQty(Math.max(1, qty - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="qty-val">{qty}</span>
            <button
              className="qty-btn"
              onClick={() => setQty(Math.min(maxQty, qty + 1))}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          {lowStock && (
            <span className="atc-low">Only {product.stockQty} left</span>
          )}
        </div>
      </div>

      <button
        className="btn-rose atc-btn"
        onClick={add}
        disabled={outOfStock}
        style={outOfStock ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
      >
        <span className="btn-ico">✦</span>{" "}
        {outOfStock ? "Out of Stock" : "Add to Cart"}
      </button>

      <button
        className="atc-btn"
        onClick={() => {
          if (hasItem(product.slug)) {
            removeItem(product.slug);
            showToast("Removed from wishlist");
          } else {
            addWishlist({
              slug: product.slug,
              name: product.name,
              price: product.price,
              mrp: product.mrp,
              image: product.images[0],
            });
            showToast("Added to wishlist 💖");
          }
        }}
        style={{
          marginTop: "12px",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.2)",
          color: hasItem(product.slug) ? "#f43f5e" : "#fff",
        }}
      >
        <span style={{ marginRight: 8, fontSize: "1.1em" }}>
          {hasItem(product.slug) ? "♥" : "♡"}
        </span>
        {hasItem(product.slug) ? "Remove from Wishlist" : "Add to Wishlist"}
      </button>

      {outOfStock && <NotifyMe product={product} />}

      {guideOpen && <SizeGuide onClose={() => setGuideOpen(false)} image={sizeGuideImg} />}
    </div>
  );
}
