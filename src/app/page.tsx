import Link from "next/link";
import { fetchCatalog } from "@/lib/db";
import { categoryNameOf } from "@/components/ProductCard";

export default async function NewHomePreview() {
  const { categories, products } = await fetchCatalog();
  const featured = products.filter((p) => p.featured).slice(0, 3);

  return (
    <main className="preview-main">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');

        /* Base & Reset */
        .preview-main {
          background-color: #050505;
          color: #f3f4f6;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }
        
        .preview-main * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* Typography */
        h1, h2, h3, h4 {
          font-family: 'Cinzel', serif;
        }
        
        .gold-accent {
          color: #d4af37;
        }

        /* Ambient Glow Background */
        .ambient-glow {
          position: absolute;
          top: -20%;
          right: -10%;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0) 60%);
          border-radius: 50%;
          z-index: 0;
          pointer-events: none;
        }

        /* Hero Section */
        .hero-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 120px 5% 60px 5%; /* Top padding clears navbar */
          z-index: 1;
          max-width: 1600px;
          margin: 0 auto;
        }

        .hero-split {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          gap: 60px;
        }

        .hero-content {
          flex: 1.2;
          max-width: 650px;
          animation: fadeUp 1s ease-out forwards;
        }

        .luxury-title {
          font-size: clamp(3rem, 6vw, 5.5rem);
          line-height: 1.1;
          font-weight: 500;
          letter-spacing: 2px;
          margin-bottom: 24px;
        }

        .luxury-title span {
          display: block;
          color: transparent;
          -webkit-text-stroke: 1px rgba(212, 175, 55, 0.8);
        }

        .hero-desc {
          color: #9ca3af;
          font-size: 1.1rem;
          line-height: 1.8;
          font-weight: 300;
          margin-bottom: 40px;
          max-width: 500px;
        }

        .btn-luxury {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 16px 40px;
          background: transparent;
          color: #d4af37;
          border: 1px solid #d4af37;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-size: 13px;
          text-decoration: none;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-luxury::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: #d4af37;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.4s ease;
          z-index: -1;
        }
        .btn-luxury:hover {
          color: #000;
        }
        .btn-luxury:hover::before {
          transform: scaleX(1);
          transform-origin: left;
        }

        /* Auto-Sliding Showcase */
        .hero-showcase {
          flex: 1;
          position: relative;
          height: 70vh;
          max-height: 750px;
          border-radius: 300px 300px 0 0; /* Elegant Arch */
          overflow: hidden;
          border: 1px solid rgba(212, 175, 55, 0.15);
          box-shadow: 0 30px 60px rgba(0,0,0,0.6);
          background: #111;
        }

        .slide-track {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .slide-item {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          background-size: cover;
          background-position: center;
          animation: crossFade 16s infinite;
        }
        
        .slide-item::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent 50%);
        }

        .slide-info {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          width: 80%;
          z-index: 10;
        }
        
        .slide-info h4 {
          color: #fff;
          font-size: 1.5rem;
          margin-bottom: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        
        .slide-info p {
          color: #d4af37;
          font-family: 'Inter', sans-serif;
          letter-spacing: 2px;
        }

        .slide-item:nth-child(1) { animation-delay: 0s; }
        .slide-item:nth-child(2) { animation-delay: 4s; }
        .slide-item:nth-child(3) { animation-delay: 8s; }
        .slide-item:nth-child(4) { animation-delay: 12s; }

        @keyframes crossFade {
          0% { opacity: 0; transform: scale(1.05); }
          10% { opacity: 1; transform: scale(1); }
          25% { opacity: 1; transform: scale(1); }
          35% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 0; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* SECTION STYLES */
        .section-padding {
          padding: 120px 5%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 70px;
        }

        .section-header p {
          color: #d4af37;
          text-transform: uppercase;
          letter-spacing: 4px;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .section-header h2 {
          font-size: clamp(2.5rem, 4vw, 3.5rem);
          font-weight: 400;
          letter-spacing: 2px;
        }

        .divider {
          width: 80px;
          height: 1px;
          background: #d4af37;
          margin: 24px auto 0;
        }

        /* CURATED COLLECTIONS GRID */
        .collections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 30px;
        }

        .collection-card {
          position: relative;
          height: 500px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 40px;
          text-decoration: none;
          background: #111;
          border: 1px solid rgba(212, 175, 55, 0.1);
          overflow: hidden;
          transition: all 0.4s ease;
        }

        .collection-card:hover {
          border-color: rgba(212, 175, 55, 0.4);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .collection-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0.5;
          transition: transform 0.8s ease, opacity 0.8s ease;
        }

        .collection-card:hover .collection-bg {
          transform: scale(1.08);
          opacity: 0.7;
        }

        .collection-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
        }

        .collection-content {
          position: relative;
          z-index: 10;
        }

        .collection-tag {
          color: #d4af37;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 12px;
          display: block;
        }

        .collection-name {
          font-size: 2rem;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 24px;
        }

        .collection-link {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #fff;
          border-bottom: 1px solid rgba(212, 175, 55, 0.4);
          padding-bottom: 6px;
          transition: border-color 0.3s;
        }
        
        .collection-card:hover .collection-link {
          border-color: #d4af37;
        }

        /* BEST SELLERS GRID */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
        }

        .product-card {
          text-decoration: none;
          color: inherit;
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.4s ease;
          display: block;
        }
        
        .product-card:hover {
          border-color: rgba(212, 175, 55, 0.2);
          transform: translateY(-5px);
        }

        .product-img-wrap {
          height: 320px;
          background: #111;
          position: relative;
          overflow: hidden;
        }

        .product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.85;
          transition: all 0.6s ease;
        }

        .product-card:hover .product-img {
          opacity: 1;
          transform: scale(1.05);
        }

        .product-info {
          padding: 24px;
          text-align: center;
        }

        .product-cat {
          color: #d4af37;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 12px;
        }

        .product-name {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 400;
          color: #f3f4f6;
          margin-bottom: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-price {
          color: #9ca3af;
          font-weight: 300;
          font-family: 'Cinzel', serif;
          font-size: 1.1rem;
        }

        .product-btn {
          display: inline-block;
          margin-top: 20px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          padding: 10px 24px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #d4af37;
          transition: all 0.3s;
        }

        .product-card:hover .product-btn {
          background: #d4af37;
          color: #000;
        }

        /* Banner */
        .preview-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: #d4af37;
          color: #000;
          text-align: center;
          padding: 12px;
          font-weight: 600;
          z-index: 1000;
          letter-spacing: 1px;
        }
        .preview-banner a {
          color: #000;
          text-decoration: underline;
        }
        
        /* Responsive */
        @media (max-width: 968px) {
          .hero-split {
            flex-direction: column;
            text-align: center;
            gap: 40px;
          }
          .hero-content {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-showcase {
            width: 100%;
            height: 50vh;
            border-radius: 20px;
          }
          .ambient-glow {
            top: 0;
            right: 0;
          }
        }
      `}</style>

      <div className="ambient-glow"></div>

      {/* HERO SECTION */}
      <section className="hero-container">
        <div className="hero-split">
          
          <div className="hero-content">
            <h1 className="luxury-title">
              MASTERPIECES 
              <span>OF LIGHT</span>
            </h1>
            <p className="hero-desc">
              Elevate your sanctuary with our exclusive collection of premium luminaires. Where cutting-edge design meets timeless elegance, transforming every room into a breathtaking experience.
            </p>
            <Link href="/shop" className="btn-luxury">
              Explore The Collection
            </Link>
          </div>

          <div className="hero-showcase">
            <div className="slide-track">
              {featured.map((p) => (
                <div 
                  key={p.slug} 
                  className="slide-item"
                  style={{ backgroundImage: `url('${p.images[0]}')` }}
                >
                  <div className="slide-info">
                    <h4>{p.name}</h4>
                    <p>₹{p.price.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* CURATED COLLECTIONS */}
      <section className="section-padding" style={{ background: '#080808' }}>
        <div className="section-header">
          <p>Shop by Category</p>
          <h2>Curated Collections</h2>
          <div className="divider"></div>
        </div>

        <div className="collections-grid">
          {categories.slice(0, 3).map((c) => (
            <Link href={`/shop?cat=${c.slug}`} key={c.slug} className="collection-card">
              <div
                className="collection-bg"
                style={{ backgroundImage: `url(${c.image})` }}
              ></div>
              <div className="collection-overlay"></div>
              <div className="collection-content">
                <span className="collection-tag">{c.tagline}</span>
                <h3 className="collection-name">{c.name}</h3>
                <span className="collection-link">Explore Collection</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="section-padding">
        <div className="section-header">
          <p>Handpicked for You</p>
          <h2>Best Sellers</h2>
          <div className="divider"></div>
        </div>

        <div className="products-grid">
          {featured.map((p) => (
            <Link href={`/product/${p.slug}`} key={p.slug} className="product-card">
              <div className="product-img-wrap">
                <img src={p.images[0]} alt={p.name} className="product-img" />
              </div>
              <div className="product-info">
                <p className="product-cat">{categoryNameOf(categories, p.category)}</p>
                <h4 className="product-name">{p.name}</h4>
                <p className="product-price">₹{p.price.toLocaleString("en-IN")}</p>
                <span className="product-btn">View Details</span>
              </div>
            </Link>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <Link href="/shop" className="btn-luxury">
            View All Products
          </Link>
        </div>
      </section>


    </main>
  );
}
