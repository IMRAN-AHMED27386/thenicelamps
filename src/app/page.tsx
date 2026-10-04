import Link from "next/link";
import HeroFx from "@/components/HeroFx";
import NotifyForm from "@/components/NotifyForm";
import ProductCard, { categoryNameOf } from "@/components/ProductCard";
import { fetchCatalog } from "@/lib/db";

export default async function Home() {
  const { categories, products } = await fetchCatalog();
  const featured = products.filter((p) => p.featured).slice(0, 6);

  return (
    <main>
      <section className="hero" id="home">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="hero-deco hero-deco-ring"></div>
        <div className="hero-deco hero-deco-ring-2"></div>
        <HeroFx />

        <div className="hero-img-panel">
          <img
            src="/hero.jpg"
            alt="TheNiceLamps Lighting"
            loading="eager"
            id="heroImg"
          />
        </div>

        <div className="hero-content">
          <p className="hero-eyebrow">New Collection 2026</p>
          <h1 className="hero-h1">
            TheNice<em>Lamps</em>
          </h1>
          <p className="hero-tagline">&ldquo;Brilliance in Every Corner&rdquo;</p>
          <p className="hero-note">
            Chandeliers &middot; Floor Lamps &middot; Wall Sconces
          </p>
          <div className="hero-btns">
            <Link href="/shop" className="btn-rose">
              <span className="btn-ico">✦</span> Shop Lighting
            </Link>
            <Link href="/#contact" className="btn-ghost">
              <span className="btn-ico">◈</span> Contact Us
            </Link>
          </div>
        </div>

        <div className="scroll-cue">
          <div className="scroll-cue-line"></div>
          <span className="scroll-cue-txt">Scroll</span>
        </div>
      </section>

      <section className="collections" id="collections">
        <div className="col-header">
          <p className="s-eyebrow rv">Shop by Category</p>
          <h2 className="s-title rv">
            Our <em>Collections</em>
          </h2>
          <div className="s-divider rv"></div>
          <p className="s-desc center rv">
            Handcrafted, brilliant designs made to illuminate your home with unmatched elegance.
          </p>
        </div>

        <div className="col-grid">
          {categories.slice(0, 3).map((c, i) => (
            <Link
              href={`/shop?cat=${c.slug}`}
              key={c.slug}
              className={`col-card ${i === 0 ? "big" : ""} rv d${i + 1}`}
            >
              <img src={c.image} alt={c.name} loading="lazy" />
              <div className="col-overlay"></div>
              <div className="col-info">
                <p className="col-cat">{c.tagline}</p>
                <h3 className="col-name">{c.name}</h3>
                <span className="col-pill">Shop Now</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-strip">
        <p className="s-eyebrow rv">Handpicked for You</p>
        <h2 className="s-title rv">
          Featured <em>Pieces</em>
        </h2>
        <div className="s-divider rv"></div>
        <div className="prod-grid featured-grid">
          {featured.map((p) => (
            <ProductCard
              key={p.slug}
              product={p}
              categoryName={categoryNameOf(categories, p.category)}
            />
          ))}
        </div>
        <div className="featured-cta rv">
          <Link href="/shop" className="btn-rose">
            <span className="btn-ico">✦</span> View All Products
          </Link>
        </div>
      </section>

      <section className="about" id="about">
        <div className="about-img-wrap rv-l">
          <img
            src="/about1.jpg"
            alt="TheNiceLamps Showroom"
            className="about-img-a"
            loading="lazy"
          />
          <img
            src="/about2.jpg"
            alt="Lighting Detail"
            className="about-img-b"
            loading="lazy"
          />
          <div className="about-frame"></div>
          <div className="about-accent">
            <span className="about-accent-num">50+</span>
            <span className="about-accent-lbl">Premium Designs</span>
          </div>
        </div>

        <div className="about-text rv-r">
          <p className="s-eyebrow">Our Story</p>
          <h2 className="s-title">
            About <em>TheNiceLamps</em>
          </h2>
          <div className="s-divider left"></div>
          <p className="s-desc">
            TheNiceLamps was born from a passion for transforming spaces through the power of light. We believe that lighting isn&rsquo;t just functional—it&rsquo;s the jewelry of your home, setting the mood and reflecting your unique style.
          </p>
          <p className="s-desc" style={{ marginTop: 16 }}>
            From breathtaking crystal chandeliers to sleek, modern floor lamps, our carefully curated collection is designed to illuminate your life and make every room feel extraordinary.
          </p>

          <div className="about-stats">
            <div className="stat rv d1">
              <span className="stat-n">50+</span>
              <span className="stat-l">Designs</span>
            </div>
            <div className="stat rv d2">
              <span className="stat-n">100%</span>
              <span className="stat-l">Quality</span>
            </div>
            <div className="stat rv d3">
              <span className="stat-n">24/7</span>
              <span className="stat-l">Support</span>
            </div>
          </div>
        </div>
      </section>

      <section className="why" id="why">
        <p className="s-eyebrow rv">Our Promise</p>
        <h2 className="s-title rv">
          Why Choose <em>TheNiceLamps</em>
        </h2>
        <div className="s-divider rv"></div>
        <p className="s-desc center rv">
          More than a lighting store — your partner in creating the perfect ambiance, committed
          to quality, design, and your satisfaction above all else.
        </p>

        <div className="why-grid">
          <div className="why-card rv d1">
            <div className="w-ico">✨</div>
            <h3 className="w-title">Premium Quality</h3>
            <p className="w-desc">
              Every piece crafted with superior materials for lasting brilliance.
              We partner with top manufacturers to bring you lighting that
              truly endures.
            </p>
          </div>
          <div className="why-card rv d2">
            <div className="w-ico">💡</div>
            <h3 className="w-title">Curated Collections</h3>
            <p className="w-desc">
              Our experts curate each collection with precision —
              chandeliers, floor lamps, and sconces for every
              room in your home.
            </p>
          </div>
          <div className="why-card rv d3">
            <div className="w-ico">💎</div>
            <h3 className="w-title">Exclusive Designs</h3>
            <p className="w-desc">
              Discover exclusive pieces you won&rsquo;t find anywhere else.
              TheNiceLamps brings you lighting that makes your space stand out beautifully.
            </p>
          </div>
          <div className="why-card rv d4">
            <div className="w-ico">🚀</div>
            <h3 className="w-title">Fast Delivery</h3>
            <p className="w-desc">
              Swift and secure delivery right to your doorstep. We handle every
              order with the utmost care — because you deserve only the best.
            </p>
          </div>
          <div className="why-card rv d5">
            <div className="w-ico">💝</div>
            <h3 className="w-title">Easy Returns</h3>
            <p className="w-desc">
              Not completely happy? No problem. Our hassle-free return policy
              ensures you are always satisfied with your TheNiceLamps experience.
            </p>
          </div>
          <div className="why-card rv d6">
            <div className="w-ico">🌟</div>
            <h3 className="w-title">Expert Advice</h3>
            <p className="w-desc">
              Our lighting advisors are here to help you find your
              perfect glow — professional assistance for every space,
              every mood.
            </p>
          </div>
        </div>
      </section>

      <section className="quote-band">
        <p className="q-text rv">
          &ldquo;Lighting is the most essential element in interior design.
          At <em>TheNiceLamps</em>, we give everyone the power to illuminate their
          spaces with brilliance.&rdquo;
        </p>
        <p className="q-by rv">&mdash; TheNiceLamps Founder</p>
      </section>

      <section className="contact-section" id="contact">
        <p className="s-eyebrow rv">Get In Touch</p>
        <h2 className="s-title rv">
          Contact <em>TheNiceLamps</em>
        </h2>
        <div className="s-divider rv"></div>
        <p className="s-desc center rv">
          Have a question or need advice? We&rsquo;d love to hear from
          you. Reach out anytime — our team is always happy to help.
        </p>

        <div className="contact-cards">
          <a href="mailto:contact@thenicelamps.com" className="contact-card rv d1">
            <div className="cc-ico">✉️</div>
            <span className="cc-lbl">Email Us</span>
            <span className="cc-value">contact@thenicelamps.com</span>
            <span className="cc-sub">Tap to send us an email</span>
          </a>

          <a href="tel:+919650363038" className="contact-card rv d2">
            <div className="cc-ico">📞</div>
            <span className="cc-lbl">Call / WhatsApp</span>
            <span className="cc-value">+91 96503 63038</span>
            <span className="cc-sub">Tap to call us directly</span>
          </a>
        </div>
      </section>

      <section className="nl-strip">
        <h2 className="rv">
          Be First to{" "}
          <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.85)" }}>
            Know
          </em>
        </h2>
        <p className="rv">
          Join our exclusive list — new arrivals, early access, and member-only
          style drops.
        </p>
        <NotifyForm
          source="Store — Newsletter"
          placeholder="your@email.com"
          buttonLabel="Subscribe"
        />
      </section>
    </main>
  );
}
