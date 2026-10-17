"use client";

import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import SiteButton from "@/components/SiteButton";
import TechArchitecture from "@/components/TechArchitecture";

/** The architecture map in brief; the full stack and development flow live on /technology. */
export default function HomeTechnology() {
  const { t } = useI18n();
  const copy = t.home.technology;

  return (
    <section className="section-padding relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid-bg opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_55%,#000_20%,transparent_75%)]"
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Technology" title={copy.title} lead={copy.lead} />
          <Reveal delay={0.1}>
            <SiteButton href="/technology">{copy.link}</SiteButton>
          </Reveal>
        </div>

        <TechArchitecture />
      </div>
    </section>
  );
}
