"use client";

import { useRef, useState } from "react";

type Slide = { type: "image" | "video"; src: string };

export default function ProductGallery({
  images,
  video,
  name,
}: {
  images: string[];
  video?: string;
  name: string;
}) {
  const slides: Slide[] = [
    ...images.filter(Boolean).map((src) => ({ type: "image" as const, src })),
    ...(video ? [{ type: "video" as const, src: video }] : []),
  ];
  const [active, setActive] = useState(0);
  const touchX = useRef<number | null>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  const go = (i: number) => {
    const next = (i + slides.length) % slides.length;
    // Pause any playing video when sliding away from it.
    Object.values(videoRefs.current).forEach((v) => v && v.pause());
    setActive(next);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 45) return;
    go(dx < 0 ? active + 1 : active - 1);
  };

  if (slides.length === 0) return null;

  return (
    <div className="pg">
      <div
        className="pg-main"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="pg-track"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div className="pg-slide" key={i}>
              {s.type === "image" ? (
                <img
                  src={s.src}
                  alt={`${name} — photo ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                />
              ) : (
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  src={s.src}
                  controls
                  playsInline
                  preload="metadata"
                />
              )}
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <>
            <button
              className="pg-arrow pg-prev"
              aria-label="Previous photo"
              onClick={() => go(active - 1)}
            >
              ‹
            </button>
            <button
              className="pg-arrow pg-next"
              aria-label="Next photo"
              onClick={() => go(active + 1)}
            >
              ›
            </button>
            <span className="pg-count">
              {active + 1} / {slides.length}
            </span>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="pg-thumbs">
          {slides.map((s, i) => (
            <button
              key={i}
              className={`pg-thumb ${i === active ? "active" : ""}`}
              aria-label={s.type === "video" ? "Play video" : `Photo ${i + 1}`}
              onClick={() => go(i)}
            >
              {s.type === "image" ? (
                <img src={s.src} alt="" loading="lazy" />
              ) : (
                <span className="pg-thumb-video">
                  <video src={s.src} preload="metadata" muted />
                  <span className="pg-play">▶</span>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
