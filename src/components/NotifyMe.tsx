"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/catalog";
import { showToast } from "@/lib/toast";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NotifyMe({ product }: { product: Product }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      showToast("Please enter a valid email address", false);
      return;
    }
    setBusy(true);
    // Doc id is product+email so the same person can't register twice —
    // the create-only rule rejects the second attempt.
    let created = false;
    try {
      await setDoc(doc(db, "stockRequests", `${product.slug}__${clean.replace(/\//g, "_")}`), {
        email: clean,
        productSlug: product.slug,
        productName: product.name,
        createdAt: new Date().toISOString(),
      });
      created = true;
    } catch {}
    if (created) {
      fetch("/api/notify-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: clean,
          productName: product.name,
          productSlug: product.slug,
        }),
      }).catch(() => {});
    }
    setBusy(false);
    setDone(true);
    showToast(
      created
        ? "You're on the list — we'll email you when it's back 💖"
        : "You're already on the list for this one 💖"
    );
  };

  if (done) {
    return (
      <p className="notify-done">
        ✓ You&apos;re on the list — we&apos;ll email you the moment it&apos;s
        back in stock.
      </p>
    );
  }

  return (
    <div className="notify-me">
      <p className="notify-label">
        Love this? Get an email the moment it&apos;s back:
      </p>
      <div className="notify-row">
        <input
          className="notify-input"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          aria-label="Email for back-in-stock alert"
        />
        <button
          className="btn-rose notify-btn"
          onClick={submit}
          disabled={busy}
        >
          {busy ? "…" : "🔔 Notify Me"}
        </button>
      </div>
    </div>
  );
}
