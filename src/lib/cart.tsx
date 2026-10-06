"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Coupon } from "./orders";

export type CartItem = {
  slug: string;
  size: string;
  qty: number;
  name: string;
  price: number;
  mrp?: number;
  image: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  mrpTotal: number;
  savings: number;
  coupon: Coupon | null;
  couponDiscount: number;
  setCoupon: (coupon: Coupon | null) => void;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  updateQty: (slug: string, size: string, qty: number) => void;
  removeItem: (slug: string, size: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "thenicelamps-cart-v3"; // bumped to v3 to clear any weird old state

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setItems(parsed.items || []);
        setCoupon(parsed.coupon || null);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, coupon }));
  }, [items, coupon, loaded]);

  const addItem = (item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const found = prev.find(
        (i) => i.slug === item.slug && i.size === item.size
      );
      if (found) {
        return prev.map((i) =>
          i.slug === item.slug && i.size === item.size
            ? { ...i, ...item, qty: i.qty + qty }
            : i
        );
      }
      return [...prev, { ...item, qty }];
    });
  };

  const updateQty = (slug: string, size: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => !(i.slug === slug && i.size === size))
        : prev.map((i) =>
            i.slug === slug && i.size === size ? { ...i, qty } : i
          )
    );
  };

  const removeItem = (slug: string, size: string) =>
    setItems((prev) =>
      prev.filter((i) => !(i.slug === slug && i.size === size))
    );

  const clear = () => {
    setItems([]);
    setCoupon(null);
  };

  const { count, subtotal, mrpTotal, savings, couponDiscount } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    let mrpTotal = 0;
    for (const i of items) {
      count += i.qty;
      subtotal += i.price * i.qty;
      mrpTotal += (i.mrp ?? i.price) * i.qty;
    }
    let savings = mrpTotal - subtotal;
    let couponDiscount = 0;
    
    if (coupon && coupon.active && subtotal >= (coupon.minOrderValue || 0)) {
      if (coupon.discountType === "percentage") {
        couponDiscount = Math.round(subtotal * (coupon.discountValue / 100));
      } else {
        couponDiscount = Math.min(subtotal, coupon.discountValue);
      }
      savings += couponDiscount;
    }

    return { count, subtotal, mrpTotal, savings, couponDiscount };
  }, [items, coupon]);

  return (
    <CartContext.Provider
      value={{ items, count, subtotal, mrpTotal, savings, coupon, couponDiscount, setCoupon, addItem, updateQty, removeItem, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
