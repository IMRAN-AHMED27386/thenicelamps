import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
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
  return `TNL-${ymd}-${rand}`;
}

export async function placeOrder(
  customer: OrderCustomer,
  items: CartItem[],
  subtotal: number,
  delivery: number,
  userId?: string
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
    total: subtotal + delivery,
  };
  await setDoc(doc(db, "orders", order.id), order);

  // Best-effort owner notification; never blocks the order.
  fetch("/api/order-notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  }).catch(() => {});

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
