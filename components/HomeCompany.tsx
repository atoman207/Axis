"use client";

import CompanyTable from "@/components/CompanyTable";
import MapEmbed from "@/components/MapEmbed";
import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import SiteButton from "@/components/SiteButton";

/** Company facts beside the map, as on the foot of most small-company home pages. */
export default function HomeCompany() {
  const { t } = useI18n();
  const copy = t.home.company;

  return (
    <section className="section-padding relative">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Company" title={copy.title} className="mb-12" />

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <Reveal>
            <CompanyTable />
            <SiteButton href="/about" className="mt-8">
              {copy.link}
            </SiteButton>
          </Reveal>

          <Reveal delay={0.1}>
            <MapEmbed className="h-[320px] lg:h-full lg:min-h-[360px]" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
