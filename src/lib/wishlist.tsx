"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type WishlistItem = {
  slug: string;
  name: string;
  price: number;
  mrp?: number;
  image: string;
};

type WishlistContextValue = {
  items: WishlistItem[];
  count: number;
  addItem: (item: WishlistItem) => void;
  removeItem: (slug: string) => void;
  hasItem: (slug: string) => boolean;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = "thenicelamps-wishlist-v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const addItem = (item: WishlistItem) => {
    setItems((prev) => {
      const found = prev.find((i) => i.slug === item.slug);
      if (found) return prev;
      return [...prev, item];
    });
  };

  const removeItem = (slug: string) =>
    setItems((prev) => prev.filter((i) => i.slug !== slug));

  const hasItem = (slug: string) => items.some((i) => i.slug === slug);

  const clear = () => setItems([]);

  const count = items.length;

  return (
    <WishlistContext.Provider
      value={{ items, count, addItem, removeItem, hasItem, clear }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
