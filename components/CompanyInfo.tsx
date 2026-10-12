"use client";

import CompanyTable from "@/components/CompanyTable";
import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

export default function CompanyInfo() {
  const { t } = useI18n();

  return (
    <section id="company" className="section-padding relative scroll-mt-20 overflow-hidden bg-band">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading eyebrow="Company" title={t.company.title} className="mb-10" />
        <Reveal delay={0.1}>
          <CompanyTable />
        </Reveal>
      </div>
    </section>
  );
}
