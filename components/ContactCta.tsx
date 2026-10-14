"use client";

import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionEyebrow from "@/components/SectionEyebrow";
import SiteButton from "@/components/SiteButton";
import { COMPANY } from "@/lib/company";

/** Closing call-to-action band shown at the foot of each page. */
export default function ContactCta() {
  const { t } = useI18n();
  const cta = t.home.cta;

  return (
    <section className="px-4 py-16 sm:px-6 md:py-24">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-ai-950 px-6 py-14 text-center sm:px-10 md:py-20 space:border space:border-line space:bg-surface">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-shu-500/25 blur-[90px]" />

        <SectionEyebrow align="center" tone="onDark" className="relative">Contact</SectionEyebrow>
        <h2 className="relative text-2xl font-bold leading-snug text-white sm:text-3xl md:text-4xl">{cta.title}</h2>
        <p className="relative mx-auto mt-5 max-w-xl text-sm leading-loose text-white/75 md:text-base">{cta.body}</p>

        <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
          <SiteButton href="/contact" tone="onDark" className="px-8 py-3.5">
            {cta.contact}
          </SiteButton>
          <SiteButton href={COMPANY.lancersUrl} external tone="onDark" className="px-8 py-3.5">
            {cta.lancers}
          </SiteButton>
        </div>
      </Reveal>
    </section>
  );
}
