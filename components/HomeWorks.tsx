"use client";

import Link from "next/link";
import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import SitePreviewImage from "@/components/SitePreviewImage";
import type { PortfolioSite } from "@/lib/portfolio/types";

export type FeaturedWork = PortfolioSite & { categoryLabel: string; stacks: string[] };

type Props = {
  works: FeaturedWork[];
  total: number;
};

/** A handful of works from the top of the list; the searchable list lives on /works. */
export default function HomeWorks({ works, total }: Props) {
  const { t } = useI18n();
  const copy = t.home.works;

  if (works.length === 0) return null;

  return (
    <section className="section-padding relative">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Works" title={copy.title} lead={copy.lead} className="mb-12" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {works.map((site, i) => (
            <Reveal key={site.id} delay={0.05 * i}>
              <a
                href={`/go/${site.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-shu-300 hover:shadow-lg"
              >
                <SitePreviewImage url={site.url} imageUrl={site.image_url} categoryLabel={site.categoryLabel} />
                <div className="flex flex-wrap gap-1.5 p-5">
                  {site.stacks.map((stack) => (
                    <span key={stack} className="rounded bg-sunken px-2 py-0.5 text-[11px] text-ink-soft">
                      {stack}
                    </span>
                  ))}
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <Link
            href="/works"
            className="inline-flex items-center gap-2 rounded-full bg-ai-950 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-ai-800 space:bg-shu-600 space:hover:bg-shu-500"
          >
            {copy.link(total)}
            <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
