import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase";
import { CartItem } from "./cart";

export type OrderStatus =
  | "new"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export type OrderCustomer = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type Coupon = {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  active: boolean;
  createdAt: string;
};

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  payment: "cod";
  userId?: string;
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  delivery: number;
  couponCode?: string;
  couponDiscount?: number;
  total: number;
};

export function makeOrderId(): string {
  const d = new Date();
  const ymd =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const rand = Array.from({ length: 4 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 32))
  ).join("");
  return `AV-${ymd}-${rand}`;
}

export async function placeOrder(
  customer: OrderCustomer,
  items: CartItem[],
  subtotal: number,
  delivery: number,
  userId?: string,
  couponCode?: string,
  couponDiscount?: number
): Promise<Order> {
  const order: Order = {
    id: makeOrderId(),
    createdAt: new Date().toISOString(),
    status: "new",
    payment: "cod",
    ...(userId ? { userId } : {}),
    customer,
    items,
    subtotal,
    delivery,
    ...(couponCode ? { couponCode } : {}),
    ...(couponDiscount ? { couponDiscount } : {}),
    total: subtotal + delivery - (couponDiscount || 0),
  };
  await setDoc(doc(db, "orders", order.id), order);

  for (const item of items) {
    if (!item.slug) continue;
    try {
      const prodRef = doc(db, "products", item.slug);
      const snap = await getDoc(prodRef);
      if (snap.exists()) {
        const pData = snap.data();
        const currentQty = typeof pData.stockQty === "number" ? pData.stockQty : null;
        const currentSold = typeof pData.soldCount === "number" ? pData.soldCount : 0;
        const quantity = item.qty || 1;
        const updates: Record<string, any> = {
          soldCount: currentSold + quantity,
        };
        if (currentQty !== null) {
          const nextQty = Math.max(0, currentQty - quantity);
          updates.stockQty = nextQty;
          if (nextQty === 0) {
            updates.inStock = false;
          }
        }
        await updateDoc(prodRef, updates);
      }
    } catch (e) {
      console.error("Failed to update inventory for", item.slug, e);
    }
  }

  return order;
}

export async function fetchOrdersForUser(uid: string): Promise<Order[]> {
  const snap = await getDocs(
    query(collection(db, "orders"), where("userId", "==", uid))
  );
  return snap.docs
    .map((d) => d.data() as Order)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
