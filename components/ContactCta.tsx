"use client";

import Link from "next/link";
import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import { COMPANY } from "@/lib/company";

/** Closing call-to-action band shown at the foot of each page. */
export default function ContactCta() {
  const { t } = useI18n();
  const cta = t.home.cta;

  return (
    <section className="px-4 py-16 sm:px-6 md:py-24">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-ai-950 px-6 py-14 text-center sm:px-10 md:py-20 space:border space:border-line space:bg-surface">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-shu-500/25 blur-[90px]" />

        <p className="relative mb-4 text-xs font-medium tracking-[0.3em] text-sky-300 uppercase">Contact</p>
        <h2 className="relative text-2xl font-bold leading-snug text-white sm:text-3xl md:text-4xl">{cta.title}</h2>
        <p className="relative mx-auto mt-5 max-w-xl text-sm leading-loose text-white/75 md:text-base">{cta.body}</p>

        <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-shu-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-shu-500"
          >
            {cta.contact}
            <span aria-hidden>→</span>
          </Link>
          <a
            href={COMPANY.lancersUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {cta.lancers}
            <span aria-hidden>↗</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
