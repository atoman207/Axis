"use client";

import { motion, useInView } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import HeroSphereClient from "@/components/HeroSphereClient";
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
    ? "border-gold-500 bg-gold-300 text-ai-950 shadow-md ring-2 ring-gold-400/60"
    : `${GOLD_BORDER} bg-gold-100 text-sumi hover:bg-gold-200`;
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
      {theme === "space" && (
        <div aria-hidden className="pointer-events-none sticky top-0 z-0 -mb-[100vh] h-screen w-full">
          <HeroSphereClient />
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
            <button
              type="button"
              onClick={() => setActiveFilter(ALL_FILTER)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${filterTabClass(activeFilter === ALL_FILTER)}`}
            >
              All
              <span className="ml-2 text-xs opacity-80">{totalProjectCount}</span>
            </button>

            {skillCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveFilter(category.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${filterTabClass(activeFilter === category.id)}`}
              >
                {category.label}
                <span className="ml-2 text-xs opacity-80">{category.sites.length}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setActiveFilter(OTHER_FILTER)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${filterTabClass(activeFilter === OTHER_FILTER)}`}
            >
              Other
              <span className="ml-2 text-xs opacity-80">{otherProjectCount}</span>
            </button>
          </div>
        </motion.div>

        {filteredCategories.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-surface px-6 py-16 text-center">
            <p className="text-lg font-semibold text-sumi">{t.works.emptyTitle}</p>
            <p className="mt-2 text-sm text-muted">
              {t.works.emptyBody}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.05 * categoryIndex }}
              >
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-accent-alt">
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
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {category.sites.map((site) => (
                    <a
                      key={site.id}
                      href={`/go/${site.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-lg"
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
                          Visit
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
