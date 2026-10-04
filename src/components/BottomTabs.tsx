"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart";

// App-style bottom navigation. Rendered always, but only shown on small
// screens when the store runs as an installed PWA (see .pwa in layout + CSS).
export default function BottomTabs() {
  const pathname = usePathname();
  const { count } = useCart();
  const barRef = useRef<HTMLElement>(null);

  // Pin the bar to the *visible* viewport bottom. On some Android PWAs the
  // layout viewport is taller than the visible area, which pushes a
  // `position: fixed; bottom: 0` bar partly off-screen (icons show, labels get
  // cut off) — and it can differ per route. Using visualViewport keeps the bar
  // glued to the real bottom on every page.
  useEffect(() => {
    const vv = window.visualViewport;
    const bar = barRef.current;
    if (!vv || !bar) return;
    const update = () => {
      // `position: fixed` anchors to the layout viewport (window.inner*), which
      // can be larger than the *visible* viewport — e.g. a page with a
      // scrollbar, or the tall home page on Android. Match the bar to the
      // visible viewport on both axes so it isn't pushed off the bottom
      // (labels cut off) or under a scrollbar (tabs shifted right).
      const bottomInset = Math.max(
        0,
        window.innerHeight - vv.height - vv.offsetTop
      );
      bar.style.bottom = `${bottomInset}px`;
      bar.style.left = `${vv.offsetLeft}px`;
      bar.style.right = "auto";
      bar.style.width = `${vv.width}px`;
    };
    update();
    requestAnimationFrame(update);
    const t = setTimeout(update, 250);
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(t);
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  const isHome = pathname === "/";
  const isShop = pathname.startsWith("/shop") || pathname.startsWith("/product");
  const isCart = pathname === "/cart" || pathname === "/checkout";
  const isAccount = pathname.startsWith("/account");

  return (
    <nav className="btabs" aria-label="Primary" ref={barRef}>
      <Link href="/" className={`btab ${isHome ? "active" : ""}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
        </svg>
        <span>Home</span>
      </Link>

      <Link href="/shop" className={`btab ${isShop ? "active" : ""}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M4 8h16l-1 12H5L4 8Z" />
          <path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8" />
        </svg>
        <span>Shop</span>
      </Link>

      <Link href="/cart" className={`btab ${isCart ? "active" : ""}`}>
        <span className="btab-ico-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M6 7h12l-1.2 12.1a1.8 1.8 0 0 1-1.8 1.6H9a1.8 1.8 0 0 1-1.8-1.6L6 7Z" />
            <path d="M9 9V6a3 3 0 0 1 6 0v3" />
          </svg>
          {count > 0 && <span className="btab-badge">{count}</span>}
        </span>
        <span>Cart</span>
      </Link>

      <Link href="/account" className={`btab ${isAccount ? "active" : ""}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="12" cy="8" r="3.4" />
          <path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" />
        </svg>
        <span>Account</span>
      </Link>
    </nav>
  );
}
