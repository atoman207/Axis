"use client";

import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import SiteButton from "@/components/SiteButton";

type Props = {
  /** Figures counted from the published work list and service menu. */
  stats: { works: number; categories: number; services: number };
};

export default function HomeAbout({ stats }: Props) {
  const { t } = useI18n();
  const about = t.home.about;
  const labels = t.home.stats;

  const figures = [
    { value: stats.works, unit: labels.worksUnit, label: labels.works },
    { value: stats.categories, unit: labels.categoriesUnit, label: labels.categories },
    { value: stats.services, unit: labels.servicesUnit, label: labels.services },
  ];

  return (
    <section className="section-padding relative">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="About"
            title={about.heading.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          />
        </div>

        <Reveal delay={0.1}>
          <div className="space-y-5 text-sm leading-loose text-ink-soft md:text-base">
            {about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <dl className="mt-10 grid grid-cols-3 divide-x divide-line border-y border-line">
            {figures.map((figure) => (
              <div key={figure.label} className="px-3 py-6 text-center first:pl-0 last:pr-0">
                <dd className="text-3xl font-bold leading-none text-sumi sm:text-4xl">
                  {figure.value}
                  {figure.unit && <span className="ml-1 text-sm font-medium text-muted">{figure.unit}</span>}
                </dd>
                <dt className="mt-3 text-[11px] leading-snug text-muted sm:text-xs">{figure.label}</dt>
              </div>
            ))}
          </dl>

          <SiteButton href="/about" className="mt-8">
            {about.link}
          </SiteButton>
        </Reveal>
      </div>
    </section>
  );
}
