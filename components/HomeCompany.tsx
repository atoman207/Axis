"use client";

import Link from "next/link";
import CompanyTable from "@/components/CompanyTable";
import MapEmbed from "@/components/MapEmbed";
import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

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
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
            >
              {copy.link}
              <span aria-hidden>→</span>
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <MapEmbed className="h-[320px] lg:h-full lg:min-h-[360px]" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
