import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";
import BrandMark from "./BrandMark";

export default function Footer() {
  return (
    <footer>
      <div className="ft-grid">
        <div className="ft-brand">
          <Link href="/" className="nav-logo-img">
            <img src="/logo1.png?v=10" alt="AidaVibes" className="custom-logo" />
          </Link>
          <p>
            Elegant fashion for every woman. Your premium destination for
            Pakistani suits, co-ord sets, Anarkali frocks and so much more.
          </p>
        </div>

        <div className="ft-col">
          <h4>Navigate</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/#about">About Us</Link></li>
            <li><Link href="/#contact">Contact</Link></li>
          </ul>
        </div>

        <div className="ft-col">
          <h4>Collections</h4>
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/shop?cat=${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="ft-col">
          <h4>Connect</h4>
          <ul>
            <li><a href="mailto:contact@aidavibes.com">Email</a></li>
            <li>
              <a
                href="https://wa.me/919650363038"
                target="_blank"
                rel="noopener"
              >
                WhatsApp
              </a>
            </li>
            <li><a href="tel:+919650363038">Call Us</a></li>
          </ul>
        </div>
      </div>

      <div className="ft-bottom">
        <p className="ft-copy">
          &copy; 2026{" "}
          <a href="https://aidavibes.com" target="_blank" rel="noopener">
            AidaVibes.com
          </a>{" "}
          &mdash; All Rights Reserved
        </p>
        <div className="ft-legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
        </div>
      </div>
    </footer>
  );
}
