export type ToastAction = { label: string; href: string };

export function showToast(msg: string, success = true, action?: ToastAction) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("av-toast", { detail: { msg, success, action } })
  );
}
