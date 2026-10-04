"use client";

import { useEffect, useRef, useState } from "react";
import { Product, SIZES, isOutOfStock } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
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
      <div className="atc-row">
        <div className="atc-field">
          <div className="atc-field-head">
            <span className="atc-label">Size</span>
            <button
              type="button"
              className="size-guide-link"
              onClick={() => setGuideOpen(true)}
            >
              <span className="sg-ico">📏</span> Size guide
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

        <div className="atc-field atc-field-qty">
          <span className="atc-label">Quantity</span>
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

      {outOfStock && <NotifyMe product={product} />}

      {guideOpen && <SizeGuide onClose={() => setGuideOpen(false)} image={sizeGuideImg} />}
    </div>
  );
}
