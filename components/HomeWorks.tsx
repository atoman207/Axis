"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, useTransform } from "framer-motion";
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
    <a
      href={`/go/${site.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden border border-line bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-shu-300 hover:shadow-lg"
    >
      <SitePreviewImage url={site.url} imageUrl={site.image_url} categoryLabel={site.categoryLabel} />
      <div className="flex flex-wrap gap-1.5 p-4 sm:p-5">
        {site.stacks.map((stack) => (
          <span key={stack} className="rounded bg-sunken px-2 py-0.5 text-[11px] text-ink-soft">
            {stack}
          </span>
        ))}
      </div>
    </a>
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
            <Reveal key={site.id} delay={0.05 * i}>
              <WorkCard site={site} />
            </Reveal>
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
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden bg-background pt-20 pb-8">
        <div className="mx-auto w-full max-w-7xl shrink-0 px-6">
          <SectionHeading eyebrow="Works" title={copy.title} lead={copy.lead} className="mb-6 md:mb-8" />
          <p className="mb-4 text-xs tracking-wide text-muted">
            {visibleCount} / {works.length}
          </p>
        </div>

        <div ref={scrollerRef} className="min-h-0 flex-1 overflow-hidden px-6">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 lg:grid-cols-3 xl:gap-6">
            {works.slice(0, visibleCount).map((site, index) => (
              <div
                key={site.id}
                className="animate-[workCardIn_420ms_ease-out]"
                style={{ animationDelay: `${Math.min(index, 8) * 20}ms` }}
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
