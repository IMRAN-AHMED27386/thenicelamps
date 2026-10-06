"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/catalog";

export default function HeroSlider({ featured }: { featured: Product[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) {
    return <div className="hero-showcase" style={{ background: "#111" }}></div>;
  }

  return (
    <div className="hero-showcase">
      {featured.map((p, i) => (
        <div
          key={p.slug}
          className={`slide-item ${i === currentIndex ? "active" : ""}`}
          style={{ backgroundImage: `url('${p.images[0]}')` }}
        >
          <div className="slide-info">
            <h4>{p.name}</h4>
            <p>
              ₹{p.price.toLocaleString("en-IN")}
              {p.mrp > p.price && (
                <s style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85em", marginLeft: "8px" }}>
                  ₹{p.mrp.toLocaleString("en-IN")}
                </s>
              )}
            </p>
          </div>
        </div>
      ))}
      <style jsx>{`
        .hero-showcase {
          flex: 1;
          position: relative;
          height: 70vh;
          max-height: 750px;
          border-radius: 300px 300px 0 0;
          overflow: hidden;
          border: 1px solid rgba(212, 175, 55, 0.15);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
          background: #111;
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
          transition: opacity 1.5s ease-in-out, transform 4s ease-in-out;
          transform: scale(1.05);
        }
        .slide-item.active {
          opacity: 1;
          transform: scale(1);
        }
        .slide-item::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent 50%);
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
          font-family: "Inter", sans-serif;
          letter-spacing: 2px;
        }
        @media (max-width: 968px) {
          .hero-showcase {
            width: 100%;
            height: 50vh;
            border-radius: 20px;
          }
        }
      `}</style>
    </div>
  );
}
