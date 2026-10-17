"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import ClipReveal from "@/components/motion/ClipReveal";
import TiltCard from "@/components/motion/TiltCard";
import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import SiteButton from "@/components/SiteButton";
import SitePreviewImage from "@/components/SitePreviewImage";
import type { PortfolioSite } from "@/lib/portfolio/types";

export type FeaturedWork = PortfolioSite & { categoryLabel: string; stacks: string[] };

type Props = {
  works: FeaturedWork[];
  total: number;
};

function WorkCard({ site }: { site: FeaturedWork }) {
  return (
    <TiltCard max={4} className="h-full">
      <a
        href={`/go/${site.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group block h-full overflow-hidden border border-line bg-surface transition-[border-color,box-shadow] duration-500 hover:border-shu-300 hover:shadow-[0_26px_50px_-28px_rgba(47,111,242,0.55),0_14px_30px_-22px_rgba(139,92,246,0.45)] focus-visible:outline-none"
      >
        <SitePreviewImage url={site.url} imageUrl={site.image_url} categoryLabel={site.categoryLabel} />
        <div className="flex flex-wrap gap-1.5 p-4 sm:p-5">
          {site.stacks.map((stack) => (
            <span
              key={stack}
              className="rounded bg-sunken px-2 py-0.5 text-[11px] text-ink-soft transition-colors duration-300 group-hover:bg-shu-50 group-hover:text-accent-strong"
            >
              {stack}
            </span>
          ))}
        </div>
      </a>
    </TiltCard>
  );
}

/** Mobile: a short grid + link to the full works page. */
function MobileWorks({ works, total }: Props) {
  const { t } = useI18n();
  const copy = t.home.works;
  const preview = works.slice(0, 6);

  return (
    <section className="section-padding relative md:hidden">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Works" title={copy.title} lead={copy.lead} className="mb-12" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {preview.map((site, i) => (
            <ClipReveal key={site.id} delay={0.06 * (i % 2)}>
              <WorkCard site={site} />
            </ClipReveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <SiteButton href="/works" className="px-8 py-4">
            {copy.link(total)}
          </SiteButton>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * PC / tablet: sticky viewport. Page scroll reveals cards one by one;
 * the grid scrolls inside the pinned frame until every site is shown.
 */
function StickyWorks({ works }: { works: FeaturedWork[] }) {
  const { t } = useI18n();
  const copy = t.home.works;
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(1);

  // ~110px of page scroll per card keeps the reveal readable for ~60 items
  const trackVh = Math.max(220, 100 + works.length * 10);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const revealed = useTransform(scrollYProgress, [0, 0.92], [1, works.length]);

  useMotionValueEvent(revealed, "change", (value) => {
    const next = Math.min(works.length, Math.max(1, Math.floor(value)));
    setVisibleCount(next);
  });

  // Keep the newest cards in view inside the sticky panel
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({
      top: scroller.scrollHeight - scroller.clientHeight,
      behavior: "auto",
    });
  }, [visibleCount]);

  return (
    <section
      ref={trackRef}
      className="relative hidden md:block"
      style={{ height: `${trackVh}vh` }}
      aria-label={copy.title}
    >
      {/* see-through on white so the mist drifts behind the cards; solid over the night sky */}
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden pt-20 pb-8 space:bg-background">
        <div className="mx-auto w-full max-w-7xl shrink-0 px-6">
          <SectionHeading eyebrow="Works" title={copy.title} lead={copy.lead} className="mb-6 md:mb-8" />
          {/* how far through the collection the scroll has travelled */}
          <div className="mb-4 flex items-center gap-4">
            <p className="text-xs tracking-wide text-muted tabular-nums">
              {visibleCount} / {works.length}
            </p>
            <div aria-hidden className="relative h-px max-w-xs flex-1 overflow-hidden bg-line">
              <motion.div
                style={{ scaleX: scrollYProgress }}
                className="absolute inset-0 origin-left bg-gradient-to-r from-shu-500 via-sky-400 to-violet-500"
              />
            </div>
          </div>
        </div>

        <div ref={scrollerRef} className="min-h-0 flex-1 overflow-hidden px-6 pt-2">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 lg:grid-cols-3 xl:gap-6">
            {works.slice(0, visibleCount).map((site, index) => (
              <div
                key={site.id}
                className="animate-[workCardIn_760ms_cubic-bezier(0.22,1,0.36,1)_backwards]"
                style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
              >
                <WorkCard site={site} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Featured works on the home page — sticky scroll reveal on md+. */
export default function HomeWorks({ works, total }: Props) {
  if (works.length === 0) return null;

  return (
    <>
      <MobileWorks works={works} total={total} />
      <StickyWorks works={works} />
    </>
  );
}
