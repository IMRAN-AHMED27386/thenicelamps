"use client";

import { useEffect, useState, useRef, useCallback, FormEvent } from "react";
import { useAuthUser } from "@/lib/customer";
import {
  fetchReviewsForProduct,
  checkUserReviewEligibility,
  submitReview,
  uploadReviewImages,
  getProductRatingSummary,
  Review,
  RatingSummary,
} from "@/lib/reviews";

/* ── Star display (read-only) ── */
export function Stars({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const full = Math.floor(rating);
  const frac = rating - full;
  const empty = 5 - full - (frac > 0 ? 1 : 0);

  return (
    <span className={`stars stars-${size}`} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: full }, (_, i) => (
        <span key={`f${i}`} className="star star-full">★</span>
      ))}
      {frac > 0 && (
        <span className="star star-partial" style={{ "--fill": `${frac * 100}%` } as React.CSSProperties}>
          ★
        </span>
      )}
      {Array.from({ length: empty }, (_, i) => (
        <span key={`e${i}`} className="star star-empty">★</span>
      ))}
    </span>
  );
}

/* ── Interactive star picker ── */
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <span className="star-picker" role="radiogroup" aria-label="Rate this product">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-pick ${n <= (hover || value) ? "star-pick-on" : ""}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}

/* ── Rating summary bar chart ── */
function RatingBars({ summary }: { summary: RatingSummary }) {
  const max = Math.max(...Object.values(summary.distribution), 1);
  return (
    <div className="rating-bars">
      {([5, 4, 3, 2, 1] as const).map((n) => (
        <div className="rating-bar-row" key={n}>
          <span className="rating-bar-label">{n}★</span>
          <div className="rating-bar-track">
            <div
              className="rating-bar-fill"
              style={{ width: `${(summary.distribution[n] / max) * 100}%` }}
            />
          </div>
          <span className="rating-bar-count">{summary.distribution[n]}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Photo picker for review form ── */
const MAX_PHOTOS = 3;
const MAX_RAW_SIZE = 5 * 1024 * 1024; // 5MB per raw file

function PhotoPicker({
  files,
  onChange,
}: {
  files: File[];
  onChange: (f: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // Generate preview URLs
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming).filter((f) => {
        if (!f.type.startsWith("image/")) return false;
        if (f.size > MAX_RAW_SIZE) return false;
        return true;
      });
      const merged = [...files, ...arr].slice(0, MAX_PHOTOS);
      onChange(merged);
    },
    [files, onChange]
  );

  const removeFile = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (files.length >= MAX_PHOTOS) return;
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="review-form-field">
      <label className="review-form-label">
        Photos <span className="review-photo-count">({files.length}/{MAX_PHOTOS})</span>
      </label>

      {/* Thumbnails */}
      {previews.length > 0 && (
        <div className="review-photo-thumbs">
          {previews.map((src, i) => (
            <div className="review-photo-thumb" key={i}>
              <img src={src} alt={`Preview ${i + 1}`} />
              <button
                type="button"
                className="review-photo-remove"
                onClick={() => removeFile(i)}
                aria-label="Remove photo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {files.length < MAX_PHOTOS && (
        <div
          className={`review-photo-drop ${dragOver ? "review-photo-drop-active" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <span className="review-photo-drop-icon">📷</span>
          <span className="review-photo-drop-text">
            Tap to add photos or drag & drop
          </span>
          <span className="review-photo-drop-hint">
            JPEG, PNG · Max 5MB each
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ── Upload progress bar ── */
function UploadProgress({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <div className="review-upload-progress">
      <div className="review-upload-bar">
        <div className="review-upload-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="review-upload-label">
        Uploading photo {done}/{total}…
      </span>
    </div>
  );
}

/* ── Lightbox for viewing review photos ── */
function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => Math.min(i + 1, images.length - 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [images.length, onClose]);

  return (
    <div className="review-lightbox" onClick={onClose}>
      <div className="review-lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <button className="review-lightbox-close" onClick={onClose} aria-label="Close">✕</button>

        {images.length > 1 && (
          <>
            <button
              className="review-lightbox-nav review-lightbox-prev"
              onClick={() => setIdx((i) => Math.max(i - 1, 0))}
              disabled={idx === 0}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              className="review-lightbox-nav review-lightbox-next"
              onClick={() => setIdx((i) => Math.min(i + 1, images.length - 1))}
              disabled={idx === images.length - 1}
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}

        <img
          className="review-lightbox-img"
          src={images[idx]}
          alt={`Review photo ${idx + 1}`}
        />

        {images.length > 1 && (
          <div className="review-lightbox-dots">
            {images.map((_, i) => (
              <span
                key={i}
                className={`review-lightbox-dot ${i === idx ? "active" : ""}`}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Review photos display in card ── */
function ReviewPhotos({ urls }: { urls: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (!urls || urls.length === 0) return null;

  return (
    <>
      <div className="review-card-photos">
        {urls.map((url, i) => (
          <button
            key={i}
            className="review-card-photo-btn"
            onClick={() => setLightbox(i)}
            aria-label={`View photo ${i + 1}`}
          >
            <img src={url} alt={`Review photo ${i + 1}`} loading="lazy" />
          </button>
        ))}
      </div>
      {lightbox !== null && (
        <Lightbox
          images={urls}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}

/* ── Main ReviewSection ── */
export default function ReviewSection({
  productSlug,
  initialReviews,
  initialSummary,
}: {
  productSlug: string;
  initialReviews: { id: string; productSlug: string; userId: string; userName: string; rating: number; title: string; comment: string; createdAt: string; verified: boolean; imageUrls?: string[] }[];
  initialSummary: { average: number; total: number; distribution: Record<1 | 2 | 3 | 4 | 5, number> };
}) {
  const { user, ready } = useAuthUser();
  const [reviews, setReviews] = useState<Review[]>(initialReviews as Review[]);
  const [summary, setSummary] = useState<RatingSummary>(initialSummary as RatingSummary);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploadDone, setUploadDone] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Check user eligibility on auth change
  useEffect(() => {
    if (!ready || !user) {
      setCanReview(false);
      setAlreadyReviewed(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const eligibility = await checkUserReviewEligibility(user.uid, productSlug);
      if (cancelled) return;
      setCanReview(eligibility.canReview);
      setAlreadyReviewed(eligibility.alreadyReviewed);
    })();
    return () => { cancelled = true; };
  }, [user, ready, productSlug]);

  const refreshReviews = async () => {
    setLoading(true);
    const fresh = await fetchReviewsForProduct(productSlug);
    setReviews(fresh);
    setSummary(getProductRatingSummary(fresh));
    setLoading(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || rating < 1 || !title.trim() || !comment.trim()) return;
    setSubmitting(true);
    try {
      // Upload photos first if any
      let imageUrls: string[] = [];
      if (photos.length > 0) {
        setUploadTotal(photos.length);
        setUploadDone(0);
        imageUrls = await uploadReviewImages(user.uid, photos, (done) => {
          setUploadDone(done);
        });
      }

      await submitReview({
        productSlug,
        userId: user.uid,
        userName: user.displayName || user.email || "Customer",
        rating,
        title: title.trim(),
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        verified: true,
        ...(imageUrls.length > 0 ? { imageUrls } : {}),
      });
      setShowForm(false);
      setTitle("");
      setComment("");
      setRating(5);
      setPhotos([]);
      setUploadDone(0);
      setUploadTotal(0);
      if (user) {
        const eligibility = await checkUserReviewEligibility(user.uid, productSlug);
        setCanReview(eligibility.canReview);
        setAlreadyReviewed(eligibility.alreadyReviewed);
      }
      await refreshReviews();
    } catch {
      // Silently fail — review will show on reload
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="reviews-section" id="reviews">
      <h2 className="s-title rv">
        Customer <em>Reviews</em>
      </h2>
      <div className="s-divider rv" />

      {/* ── Summary ── */}
      <div className="review-summary">
        <div className="review-summary-left">
          <p className="review-big-number">{summary.average.toFixed(1)}</p>
          <Stars rating={summary.average} size="lg" />
          <p className="review-total">{summary.total} review{summary.total !== 1 ? "s" : ""}</p>
        </div>
        <RatingBars summary={summary} />
      </div>

      {/* ── Write review CTA ── */}
      <div className="review-cta">
        {!ready ? null : !user ? (
          <p className="review-hint">
            <a href="/account" className="review-link">Sign in</a> to leave a review after your order is delivered.
          </p>
        ) : alreadyReviewed ? (
          <p className="review-hint">✓ You've already reviewed this product. Thank you!</p>
        ) : canReview ? (
          <button
            className="btn-rose review-write-btn"
            onClick={() => setShowForm(!showForm)}
          >
            <span className="btn-ico">✦</span> Write a Review
          </button>
        ) : (
          <p className="review-hint">
            Purchase this product to leave a review. Reviews are unlocked once your order is delivered.
          </p>
        )}
      </div>

      {/* ── Review form ── */}
      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-form-field">
            <label className="review-form-label">Your Rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div className="review-form-field">
            <label className="review-form-label">Title</label>
            <input
              className="review-form-input"
              type="text"
              maxLength={120}
              placeholder="Summarize your experience…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="review-form-field">
            <label className="review-form-label">Review</label>
            <textarea
              className="review-form-textarea"
              maxLength={1000}
              rows={4}
              placeholder="Share your thoughts about this product…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          {/* Photo picker */}
          <PhotoPicker files={photos} onChange={setPhotos} />

          {/* Upload progress */}
          {submitting && uploadTotal > 0 && (
            <UploadProgress done={uploadDone} total={uploadTotal} />
          )}

          <div className="review-form-actions">
            <button
              type="submit"
              className="btn-rose review-submit-btn"
              disabled={submitting || rating < 1 || !title.trim() || !comment.trim()}
            >
              {submitting
                ? uploadTotal > 0
                  ? "Uploading…"
                  : "Submitting…"
                : "Submit Review"}
            </button>
            <button
              type="button"
              className="review-cancel-btn"
              onClick={() => { setShowForm(false); setPhotos([]); }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Reviews list ── */}
      {reviews.length === 0 ? (
        <p className="review-empty">
          No reviews yet. Be the first to share your experience!
        </p>
      ) : (
        <div className="review-list">
          {reviews.map((r) => (
            <div className="review-card" key={r.id}>
              <div className="review-card-top">
                <div>
                  <Stars rating={r.rating} size="sm" />
                  <h4 className="review-card-title">{r.title}</h4>
                </div>
                {r.verified && (
                  <span className="review-verified">✓ Verified Purchase</span>
                )}
              </div>
              <p className="review-card-comment">{r.comment}</p>

              {/* Review photos */}
              <ReviewPhotos urls={r.imageUrls || []} />

              <p className="review-card-meta">
                {r.userName} ·{" "}
                {new Date(r.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
