"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ToastAction } from "@/lib/toast";

export default function Effects() {
  const pathname = usePathname();
  const [toast, setToast] = useState<{
    msg: string;
    success: boolean;
    action?: ToastAction;
  } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [showBtt, setShowBtt] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -55px 0px" }
    );
    const scan = () =>
      document
        .querySelectorAll(".rv:not(.in), .rv-l:not(.in), .rv-r:not(.in)")
        .forEach((el) => obs.observe(el));
    scan();
    const mut = new MutationObserver(scan);
    mut.observe(document.body, { childList: true, subtree: true });
    return () => {
      obs.disconnect();
      mut.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setShowBtt(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;
    const onToast = (e: Event) => {
      const { msg, success, action } = (e as CustomEvent).detail;
      setToast({ msg, success, action });
      setToastVisible(true);
      clearTimeout(hideTimer);
      // Toasts with an action button stay a little longer so it can be tapped.
      hideTimer = setTimeout(() => setToastVisible(false), action ? 5500 : 3800);
    };
    window.addEventListener("av-toast", onToast);
    return () => {
      window.removeEventListener("av-toast", onToast);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      <button
        id="btt"
        className={showBtt ? "show" : ""}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
      <div
        className={`toast ${toastVisible ? "show" : ""} ${toast?.action ? "has-action" : ""}`}
        style={toast?.success === false ? { border: '1px solid rgba(255,100,100,0.4)' } : undefined}
      >
        <span>{toast?.msg}</span>
        {toast?.action && (
          <Link
            href={toast.action.href}
            className="toast-action"
            onClick={() => setToastVisible(false)}
          >
            {toast.action.label} →
          </Link>
        )}
      </div>
    </>
  );
}
