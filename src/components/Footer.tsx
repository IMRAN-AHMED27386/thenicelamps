import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";
import BrandMark from "./BrandMark";

export default function Footer() {
  return (
    <footer>
      <div className="ft-grid">
        <div className="ft-brand">
          <Link href="/" className="nav-logo-img">
            <img src="/logo-new.png" alt="TheNiceLamps" className="custom-logo" />
          </Link>
          <p>
            Brilliance in Every Corner. Your premium destination for luxury chandeliers, modern floor lamps, and elegant wall sconces.
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
            <li><a href="mailto:contact@thenicelamps.com">Email</a></li>
            <li>
              <a
                href="https://wa.me/918496944407"
                target="_blank"
                rel="noopener"
              >
                WhatsApp
              </a>
            </li>
            <li><a href="tel:+918496944407">Call Us (Main)</a></li>
            <li><a href="tel:+918042036786">Call Us (Alt)</a></li>
          </ul>
        </div>

        <div className="ft-col" style={{ maxWidth: '250px' }}>
          <h4>Address</h4>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.6", marginTop: "1rem" }}>
            <strong>Firoz Ahmed</strong><br/>
            11, B.V.K. Iyengar Road,<br/>
            Bengaluru – 560 053
          </p>
        </div>
      </div>

      <div className="ft-bottom">
        <p className="ft-copy">
          &copy; 2026{" "}
          <a href="https://thenicelamps.com" target="_blank" rel="noopener">
            TheNiceLamps.com
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
