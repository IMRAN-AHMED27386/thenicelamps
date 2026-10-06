"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuthUser } from "@/lib/customer";
import BrandMark from "./BrandMark";

export default function Nav() {
  const [sticky, setSticky] = useState(false);
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user } = useAuthUser();
  const accountLabel = user
    ? `Hi, ${(user.displayName || user.email || "Account").split(" ")[0].split("@")[0]}`
    : "Account";

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 70);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <nav id="nav" className={sticky ? "sticky" : ""}>
        <Link href="/" className="nav-logo" onClick={close}>
          <img src="/logo-new.jpeg" alt="TheNiceLamps" className="custom-logo" />
          <span>
            TheNice<em>Lamps</em>
          </span>
        </Link>
        <ul className="nav-links">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/shop">Shop</Link></li>
          <li><Link href="/#about">About</Link></li>
          <li><Link href="/#contact">Contact</Link></li>
          <li><Link href="/account">{accountLabel}</Link></li>
          <li>
            <Link
              href="/cart"
              className="nav-cart-icon"
              aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M6 7h12l-1.2 12.1a1.8 1.8 0 0 1-1.8 1.6H9a1.8 1.8 0 0 1-1.8-1.6L6 7Z" />
                <path d="M9 9V6a3 3 0 0 1 6 0v3" />
              </svg>
              {count > 0 && <span className="nav-cart-count">{count}</span>}
            </Link>
          </li>
        </ul>
        <div className="nav-mob-actions">
          <Link
            href="/cart"
            className="nav-cart-mob"
            aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
            onClick={close}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 7h12l-1.2 12.1a1.8 1.8 0 0 1-1.8 1.6H9a1.8 1.8 0 0 1-1.8-1.6L6 7Z" />
              <path d="M9 9V6a3 3 0 0 1 6 0v3" />
            </svg>
            {count > 0 && <span className="nav-cart-badge">{count}</span>}
          </Link>
          <button
            className={`ham ${open ? "open" : ""}`}
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div className={`mob-nav ${open ? "open" : ""}`}>
        <Link href="/" onClick={close}>Home</Link>
        <div className="mob-divider"></div>
        <Link href="/shop" onClick={close}>Shop</Link>
        <div className="mob-divider"></div>
        <Link href="/#about" onClick={close}>About</Link>
        <div className="mob-divider"></div>
        <Link href="/#contact" onClick={close}>Contact</Link>
        <div className="mob-divider"></div>
        <Link href="/account" onClick={close}>{accountLabel}</Link>
        <div className="mob-divider"></div>
        <Link href="/cart" onClick={close}>
          Cart{count > 0 ? ` (${count})` : ""}
        </Link>
      </div>
    </>
  );
}
