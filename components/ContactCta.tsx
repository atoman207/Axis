"use client";

import Link from "next/link";
import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionEyebrow from "@/components/SectionEyebrow";
import { COMPANY } from "@/lib/company";

/** Closing call-to-action band shown at the foot of each page. */
export default function ContactCta() {
  const { t } = useI18n();
  const cta = t.home.cta;

  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20 md:py-28">
      {/* Full-bleed background — same on every page that mounts ContactCta */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-ai-950 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/sites/bg/contact_bg.png)" }}
      />
      {/* Readability scrim over the photo */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[#060d1f]/72 via-[#060d1f]/55 to-[#060d1f]/78"
      />

      <Reveal className="relative mx-auto max-w-6xl px-6 text-center sm:px-10">
        <SectionEyebrow align="center" tone="onDark">
          Contact
        </SectionEyebrow>

        <h2 className="mx-auto max-w-[20em] font-sans text-[clamp(1.05rem,4.2vw,2.5rem)] font-bold leading-snug tracking-[0.02em] text-white sm:max-w-none sm:whitespace-nowrap">
          {cta.title}
        </h2>

        <div className="mx-auto mt-6 max-w-2xl space-y-2 text-base leading-[1.9] text-white/85">
          {cta.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contact"
            className="group inline-flex items-center justify-center gap-1.5 rounded-xl bg-shu-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-black/25 transition-colors hover:bg-shu-500"
          >
            <span className="inline-block origin-center transition-transform duration-300 group-hover:scale-110">
              {cta.contact}
            </span>
            <span
              aria-hidden
              className="inline-flex w-[1em] shrink-0 justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              →
            </span>
          </Link>

          <Link
            href="/works"
            className="group inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/60 hover:bg-white/12"
          >
            <span className="inline-block origin-center transition-transform duration-300 group-hover:scale-110">
              {cta.works}
            </span>
            <span
              aria-hidden
              className="inline-flex w-[1em] shrink-0 justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              →
            </span>
          </Link>
        </div>

        <p className="mt-6 text-xs tracking-wide text-white/60">
          {cta.lancersLabel}
          <a
            href={COMPANY.lancersUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sky-300 underline-offset-4 transition-colors hover:text-sky-200 hover:underline"
          >
            {cta.lancers}
          </a>
        </p>

        <p className="mt-4 text-[11px] tracking-wide text-white/45">{cta.note}</p>
      </Reveal>
    </section>
  );
}
