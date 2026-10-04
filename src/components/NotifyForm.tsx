"use client";

import { useState } from "react";
import { showToast } from "@/lib/toast";

export default function NotifyForm({
  source,
  placeholder,
  buttonLabel,
}: {
  source: string;
  placeholder: string;
  buttonLabel: string;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const val = email.trim();
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      showToast("Please enter a valid email address 📧", false);
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: val, signup_source: source, botcheck: "" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("You're on the list! We'll keep you posted. 💖");
        setEmail("");
      } else {
        showToast("Hmm, something went wrong. Please try again.", false);
      }
    } catch {
      showToast("Network error — please check your connection.", false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="notify-wrap rv">
      <input
        type="email"
        className="notify-input"
        placeholder={placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button className="notify-btn" onClick={submit} disabled={sending}>
        {sending ? "Sending…" : buttonLabel}
      </button>
    </div>
  );
}
