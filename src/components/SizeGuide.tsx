"use client";

import { useEffect } from "react";

// Generic dimensions guide
const ROWS = [
  { size: "Standard", w: "12", h: "18", d: "12" },
  { size: "Large", w: "16", h: "24", d: "16" },
];

export default function SizeGuide({ onClose, image }: { onClose: () => void, image?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="sg-overlay" onClick={onClose}>
      <div
        className="sg-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Size guide"
      >
        <button className="sg-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        
        {image ? (
          <div style={{ marginTop: 24 }}>
            <img src={image} alt="Size Guide" style={{ width: "100%", height: "auto", borderRadius: 8 }} />
          </div>
        ) : (
          <>
            <h3 className="sg-title">Size Guide</h3>
            <p className="sg-sub">All measurements in inches</p>

            <table className="sg-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Width</th>
                  <th>Height</th>
                  <th>Depth</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.size}>
                    <td className="sg-size">{r.size}</td>
                    <td>{r.w}"</td>
                    <td>{r.h}"</td>
                    <td>{r.d}"</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="sg-tips">
              <p className="sg-tips-head">How to measure</p>
              <ul>
                <li>
                  <strong>Width:</strong> measure across the widest part.
                </li>
                <li>
                  <strong>Height:</strong> measure from the top to the base.
                </li>
                <li>
                  <strong>Depth:</strong> measure the projection from the wall.
                </li>
              </ul>
              <p className="sg-note">
                Slight variations may occur due to manual measurements.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
