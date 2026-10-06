"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Product, inr } from "@/lib/catalog"; // In a real app, you'd fetch wishlist items here

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading a wishlist from local storage or backend
    setTimeout(() => {
      setLoading(false);
    }, 600);
  }, []);

  return (
    <main className="wishlist-main section-padding">
      <style>{`
        .wishlist-main {
          min-height: 80vh;
          background: #050505;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 150px;
        }

        .wishlist-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .wishlist-header h1 {
          font-family: 'Cinzel', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 400;
          letter-spacing: 2px;
          margin-bottom: 15px;
        }

        .gold-divider {
          width: 60px;
          height: 2px;
          background: #d4af37;
          margin: 0 auto;
        }

        .empty-wishlist {
          text-align: center;
          margin-top: 60px;
          animation: fadeIn 1s ease-out;
        }

        .empty-icon {
          font-size: 4rem;
          color: rgba(212, 175, 55, 0.5);
          margin-bottom: 30px;
        }

        .empty-text {
          font-size: 1.2rem;
          color: #9ca3af;
          margin-bottom: 40px;
        }

        .explore-btn {
          display: inline-block;
          padding: 15px 40px;
          background: transparent;
          color: #d4af37;
          border: 1px solid #d4af37;
          font-size: 0.9rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .explore-btn:hover {
          background: #d4af37;
          color: #050505;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(212, 175, 55, 0.2);
          border-top-color: #d4af37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-top: 100px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <div className="gold-divider"></div>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-icon">♡</div>
          <p className="empty-text">Your wishlist is currently empty.</p>
          <Link href="/shop" className="explore-btn">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {/* We will map over actual wishlist items here when the backend is ready */}
        </div>
      )}
    </main>
  );
}
