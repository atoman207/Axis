"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useMemo, useRef, useState, type ReactNode } from "react";
import HeroSphereClient from "@/components/HeroSphereClient";
import ClipReveal from "@/components/motion/ClipReveal";
import TiltCard from "@/components/motion/TiltCard";
import SceneBoundary from "@/components/SceneBoundary";
import { useWebGLSupport } from "@/lib/webgl";
import { useI18n, useTheme } from "@/components/PreferencesProvider";
import SitePreviewImage from "@/components/SitePreviewImage";
import type { PortfolioData } from "@/lib/portfolio/types";
import { OTHER_FILTER } from "@/lib/portfolio/types";
import { getCategoriesForFilter, isOtherCategory } from "@/lib/portfolio/utils";

const ALL_FILTER = "all";

// A solid sky outline is too loud on the dark sky, so it softens in the space theme.
const GOLD_BORDER = "border-gold-300 space:border-gold-300/30";

function filterTabClass(isActive: boolean) {
  return isActive
    ? "border-gold-500 text-ai-950"
    : `${GOLD_BORDER} bg-gold-100 text-sumi hover:bg-gold-200`;
}

/** Stack filter tab; the active highlight glides between tabs instead of jumping. */
function FilterTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`relative isolate rounded-full border px-4 py-2 text-sm font-medium transition-[color,background-color,transform] duration-300 active:scale-[0.97] ${filterTabClass(active)}`}
    >
      {active && (
        <motion.span
          layoutId="works-filter-active"
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full bg-gold-300 shadow-md ring-2 ring-gold-400/60"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      {children}
    </button>
  );
}

type Props = {
  portfolio: PortfolioData;
};

export default function Works({ portfolio }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useI18n();
  const { theme } = useTheme();
  const webgl = useWebGLSupport();

  const { skillCategories, totalProjectCount, otherProjectCount } = portfolio;

  const filteredCategories = useMemo(
    () => getCategoriesForFilter(portfolio, activeFilter, searchQuery),
    [portfolio, activeFilter, searchQuery]
  );

  const visibleProjectCount = useMemo(
    () => filteredCategories.reduce((count, category) => count + category.sites.length, 0),
    [filteredCategories]
  );

  const hasActiveFilters =
    activeFilter !== ALL_FILTER || searchQuery.trim().length > 0;

  return (
    <section id="works" className="relative scroll-mt-20">
      {/* the orbiting globe belongs to the space theme; the white theme keeps the list plain */}
      {theme === "space" && webgl && (
        <div aria-hidden className="pointer-events-none sticky top-0 z-0 -mb-[100vh] h-screen w-full">
          <SceneBoundary>
            <HeroSphereClient />
          </SceneBoundary>
        </div>
      )}

      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-20 md:pt-16 md:pb-28">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.15 }}
          className={`mb-10 rounded-3xl border ${GOLD_BORDER} bg-gold-50 p-5 md:p-6 shadow-sm`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <label htmlFor="portfolio-search" className="sr-only">
                Search portfolio
              </label>
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                id="portfolio-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t.works.searchPlaceholder}
                className={`w-full rounded-2xl border ${GOLD_BORDER} bg-field py-3 pl-11 pr-4 text-sm text-ink-soft outline-none transition placeholder:text-faint focus:border-gold-500 focus:ring-4 focus:ring-gold-200`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
              <span className={`rounded-full border ${GOLD_BORDER} bg-gold-200 px-3 py-1.5 font-medium text-sumi`}>
                {visibleProjectCount} / {totalProjectCount} projects
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter(ALL_FILTER);
                    setSearchQuery("");
                  }}
                  className="rounded-full border border-gold-400 bg-field px-3 py-1.5 text-ink-soft transition hover:bg-gold-100"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-ink-soft">
            Skills / Stacks
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <FilterTab active={activeFilter === ALL_FILTER} onClick={() => setActiveFilter(ALL_FILTER)}>
              All
              <span className="ml-2 text-xs opacity-80">{totalProjectCount}</span>
            </FilterTab>

            {skillCategories.map((category) => (
              <FilterTab
                key={category.id}
                active={activeFilter === category.id}
                onClick={() => setActiveFilter(category.id)}
              >
                {category.label}
                <span className="ml-2 text-xs opacity-80">{category.sites.length}</span>
              </FilterTab>
            ))}

            <FilterTab active={activeFilter === OTHER_FILTER} onClick={() => setActiveFilter(OTHER_FILTER)}>
              Other
              <span className="ml-2 text-xs opacity-80">{otherProjectCount}</span>
            </FilterTab>
          </div>
        </motion.div>

        {/* switching stacks cross-fades the whole result set; typing a search just updates it */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {filteredCategories.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-line bg-surface px-6 py-16 text-center">
                <p className="text-lg font-semibold text-sumi">{t.works.emptyTitle}</p>
                <p className="mt-2 text-sm text-muted">
                  {t.works.emptyBody}
                </p>
              </div>
            ) : (
              <div className="space-y-14">
                {filteredCategories.map((category) => (
                  <div key={category.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
                    >
                      <div>
                        <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-accent-alt">
                          <span aria-hidden className="h-px w-6 bg-gradient-to-r from-sky-400 to-violet-500" />
                          {isOtherCategory(category) ? "Other" : "Skill"}
                        </p>
                        <h3 className="text-xl md:text-2xl font-bold text-sumi">{category.label}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.stacks.map((stack) => (
                          <span
                            key={stack}
                            className={`rounded-full border ${GOLD_BORDER} bg-gold-200 px-2.5 py-1 text-xs font-medium text-sumi`}
                          >
                            {stack}
                          </span>
                        ))}
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {category.sites.map((site, siteIndex) => (
                        <ClipReveal key={site.id} delay={0.07 * (siteIndex % 3)} className="h-full">
                          <TiltCard max={4} className="h-full rounded-2xl">
                            <a
                              href={`/go/${site.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block h-full overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow] duration-500 hover:border-gold-400 hover:shadow-[0_26px_50px_-28px_rgba(47,111,242,0.55),0_14px_30px_-22px_rgba(139,92,246,0.45)] focus-visible:outline-none"
                            >
                              <SitePreviewImage
                                url={site.url}
                                imageUrl={site.image_url}
                                categoryLabel={category.label}
                              />

                              <div className="flex items-start justify-between gap-3 p-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {category.stacks.map((stack) => (
                                    <span
                                      key={`${site.id}-${stack}`}
                                      className="rounded bg-gold-100 px-2 py-0.5 text-[11px] text-ink-soft"
                                    >
                                      {stack}
                                    </span>
                                  ))}
                                </div>
                                <span className={`shrink-0 rounded-full border ${GOLD_BORDER} bg-gold-100 px-2 py-0.5 text-[10px] font-medium text-ink-soft transition group-hover:bg-gold-200`}>
                                  Visit <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                                </span>
                              </div>
                            </a>
                          </TiltCard>
                        </ClipReveal>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
