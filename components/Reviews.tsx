"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { useI18n } from "@/components/PreferencesProvider";

type Review = {
  id: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  body: string;
  avatar: string;
};

/**
 * Japanese professional headshot avatars (local assets).
 * Names and review text live in the dictionary, in the same order.
 */
const reviewMeta = [
  { id: "1",  rating: 5, avatar: "/reviews/avatar-01.jpg" },
  { id: "2",  rating: 5, avatar: "/reviews/avatar-02.jpg" },
  { id: "3",  rating: 5, avatar: "/reviews/avatar-03.jpg" },
  { id: "4",  rating: 5, avatar: "/reviews/avatar-04.jpg" },
  { id: "5",  rating: 4, avatar: "/reviews/avatar-05.jpg" },
  { id: "6",  rating: 5, avatar: "/reviews/avatar-06.jpg" },
  { id: "7",  rating: 5, avatar: "/reviews/avatar-07.jpg" },
  { id: "8",  rating: 5, avatar: "/reviews/avatar-08.jpg" },
  { id: "9",  rating: 4, avatar: "/reviews/avatar-09.jpg" },
  { id: "10", rating: 5, avatar: "/reviews/avatar-10.jpg" },
];

const PAGE_SIZE = 3;

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 ${i < rating ? "text-gold-500" : "text-ghost"}`}
          fill="currentColor"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review, index, avatarAlt }: { review: Review; index: number; avatarAlt: string }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, delay: (index % PAGE_SIZE) * 0.05 }}
      className="rounded-2xl border border-line-soft bg-surface p-6 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-line bg-sunken">
          <Image
            src={review.avatar}
            alt={avatarAlt}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-sumi">{review.name}</p>
          <p className="truncate text-xs text-faint">
            {review.role} / {review.company}
          </p>
        </div>
        <Stars rating={review.rating} />
      </div>
      <p className="text-sm leading-relaxed text-ink-soft">{review.body}</p>
    </motion.article>
  );
}

export default function Reviews() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { t } = useI18n();

  const reviews: Review[] = reviewMeta.map((meta, i) => ({ ...meta, ...t.reviews.items[i] }));
  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;
  const canCollapse = visibleCount > PAGE_SIZE;

  return (
    <section id="reviews" className="section-padding relative overflow-hidden bg-band">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-shu-100/40 blur-[110px]" />
      </div>

      <div ref={ref} className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center sm:mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="mb-4 text-xs uppercase tracking-[0.3em] text-accent"
          >
            Reviews
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-3 text-2xl font-bold sm:text-3xl md:text-5xl"
          >
            {t.reviews.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted md:text-base"
          >
            {t.reviews.lead}
          </motion.p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4">
          <AnimatePresence initial={false} mode="popLayout">
            {visibleReviews.map((review, index) => (
              <ReviewCard
                key={review.id}
                review={review}
                index={index}
                avatarAlt={t.reviews.avatarAlt(review.name)}
              />
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.35 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <p className="text-xs text-faint">
            {t.reviews.showing(visibleCount, reviews.length)}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {hasMore && (
              <button
                type="button"
                onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, reviews.length))}
                className="rounded-xl bg-shu-700 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-shu-800"
              >
                See More
              </button>
            )}
            {canCollapse && (
              <button
                type="button"
                onClick={() => setVisibleCount(PAGE_SIZE)}
                className="rounded-xl border border-line bg-surface px-7 py-3 text-sm font-semibold text-ink-soft transition hover:border-shu-200 hover:text-accent-strong"
              >
                See Less
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
