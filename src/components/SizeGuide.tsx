"use client";

import { useEffect } from "react";

// Standard India/Pakistan women's suit sizing, in inches.
const ROWS = [
  { size: "XS", bust: "32", waist: "26", hip: "35" },
  { size: "S", bust: "34", waist: "28", hip: "37" },
  { size: "M", bust: "36", waist: "30", hip: "39" },
  { size: "L", bust: "38", waist: "32", hip: "41" },
  { size: "XL", bust: "40", waist: "34", hip: "43" },
  { size: "XXL", bust: "42", waist: "36", hip: "45" },
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
                  <th>Bust</th>
                  <th>Waist</th>
                  <th>Hip</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.size}>
                    <td className="sg-size">{r.size}</td>
                    <td>{r.bust}"</td>
                    <td>{r.waist}"</td>
                    <td>{r.hip}"</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="sg-tips">
              <p className="sg-tips-head">How to measure</p>
              <ul>
                <li>
                  <strong>Bust:</strong> measure around the fullest part of your
                  chest.
                </li>
                <li>
                  <strong>Waist:</strong> measure around the narrowest part of your
                  waistline.
                </li>
                <li>
                  <strong>Hip:</strong> measure around the fullest part of your
                  hips.
                </li>
              </ul>
              <p className="sg-note">
                Between two sizes? We recommend choosing the larger one for a
                comfortable fit.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
