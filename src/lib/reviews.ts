"use client";

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

export type Review = {
  id: string;
  productSlug: string;
  userId: string;
  userName: string;
  rating: number; // 1–5
  title: string;
  comment: string;
  createdAt: string;
  verified: boolean; // true if user had a delivered order for this product
  imageUrls?: string[]; // up to 3 photo URLs
};

export type RatingSummary = {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

/* ── Fetch all reviews for a product ── */
export async function fetchReviewsForProduct(
  productSlug: string
): Promise<Review[]> {
  const snap = await getDocs(
    query(
      collection(db, "reviews"),
      where("productSlug", "==", productSlug)
    )
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Review)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export type UserReviewEligibility = {
  canReview: boolean;
  alreadyReviewed: boolean;
  deliveredCount: number;
  reviewedCount: number;
};

/* ── Check user review eligibility based on delivered purchases ── */
export async function checkUserReviewEligibility(
  userId: string,
  productSlug: string
): Promise<UserReviewEligibility> {
  const [ordersSnap, reviewsSnap] = await Promise.all([
    getDocs(
      query(
        collection(db, "orders"),
        where("userId", "==", userId),
        where("status", "==", "delivered")
      )
    ),
    getDocs(
      query(
        collection(db, "reviews"),
        where("productSlug", "==", productSlug),
        where("userId", "==", userId)
      )
    ),
  ]);

  let deliveredCount = 0;
  for (const d of ordersSnap.docs) {
    const order = d.data();
    const items = (order.items || []) as { slug?: string; productSlug?: string; qty?: number; quantity?: number }[];
    for (const it of items) {
      if (it.slug === productSlug || it.productSlug === productSlug) {
        deliveredCount += it.qty || it.quantity || 1;
      }
    }
  }

  const reviewedCount = reviewsSnap.size;
  const canReview = deliveredCount > reviewedCount;
  const alreadyReviewed = deliveredCount > 0 && reviewedCount >= deliveredCount;

  return {
    canReview,
    alreadyReviewed,
    deliveredCount,
    reviewedCount,
  };
}

/* ── Legacy helpers ── */
export async function hasUserReviewed(
  userId: string,
  productSlug: string
): Promise<boolean> {
  const res = await checkUserReviewEligibility(userId, productSlug);
  return res.alreadyReviewed;
}

export async function canUserReview(
  userId: string,
  productSlug: string
): Promise<boolean> {
  const res = await checkUserReviewEligibility(userId, productSlug);
  return res.canReview;
}

/* ── Client-side image compression ── */
const MAX_DIMENSION = 800;
const JPEG_QUALITY = 0.75;

export function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Compression failed"));
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image file"));
    };
    img.src = url;
  });
}

/* ── Upload review images to Firebase Storage ── */
export async function uploadReviewImages(
  userId: string,
  files: File[],
  onProgress?: (done: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const compressed = await compressImage(files[i]);
    const filename = `${Date.now()}_${i}.jpg`;
    const storageRef = ref(storage, `reviews/${userId}/${filename}`);
    await uploadBytes(storageRef, compressed, {
      contentType: "image/jpeg",
    });
    const url = await getDownloadURL(storageRef);
    urls.push(url);
    onProgress?.(i + 1, total);
  }

  return urls;
}

/* ── Submit a new review ── */
export async function submitReview(
  review: Omit<Review, "id">
): Promise<Review> {
  const id =
    review.productSlug +
    "_" +
    review.userId +
    "_" +
    Date.now().toString(36);
  const full: Review = { ...review, id };
  await setDoc(doc(db, "reviews", id), full);
  return full;
}

/* ── Delete a review (admin or own) ── */
export async function deleteReview(id: string): Promise<void> {
  await deleteDoc(doc(db, "reviews", id));
}

/* ── Compute rating summary from an array of reviews ── */
export function getProductRatingSummary(reviews: Review[]): RatingSummary {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  let sum = 0;
  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as
      | 1
      | 2
      | 3
      | 4
      | 5;
    distribution[star]++;
    sum += star;
  }
  return {
    average: reviews.length > 0 ? sum / reviews.length : 0,
    total: reviews.length,
    distribution,
  };
}
