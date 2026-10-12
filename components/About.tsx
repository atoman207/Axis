"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { useI18n } from "@/components/PreferencesProvider";
import SectionHeading from "@/components/SectionHeading";
import { COMPANY } from "@/lib/company";

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const bioRef = useRef(null);
  const bioIn = useInView(bioRef, { once: true, margin: "-60px" });
  const { t } = useI18n();
  const { specialties, works, values } = t.about;

  return (
    <section id="about" className="section-padding relative scroll-mt-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-shu-50 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Message from the representative director, signed below */}
        <div ref={ref} className="mx-auto mb-24 max-w-3xl text-left">
          <SectionHeading eyebrow="Message" title={t.about.title} className="mb-10" />
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-5 text-left text-ink-soft leading-loose text-sm md:text-base"
          >
            {t.about.intro.map((paragraph) => (
              <p key={paragraph}>
                {paragraph.split("\n").map((line, index) => (
                  <span key={line}>
                    {index > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
            ))}

            <p className="mt-12 flex flex-col items-end gap-2 border-t border-line pt-8 text-right">
              <span className="text-xs tracking-wider text-muted">{COMPANY.name}</span>
              <span className="flex items-baseline gap-4">
                <span className="text-sm text-ink-soft">{t.about.signatureTitle}</span>
                <span className="text-xl font-bold tracking-wide text-sumi md:text-2xl">{COMPANY.representative}</span>
              </span>
            </p>
          </motion.div>
        </div>

        {/* Details */}
        <div ref={bioRef} className="space-y-10 md:space-y-16">
          {/* Specialties */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={bioIn ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="bg-surface rounded-3xl p-8 md:p-12 border border-line shadow-sm"
          >
            <h3 className="text-xl md:text-2xl font-bold text-sumi mb-4">{specialties.title}</h3>
            {specialties.body.map((paragraph, i) => (
              <p
                key={paragraph}
                className={`text-ink-soft leading-relaxed text-sm md:text-base ${
                  i < specialties.body.length - 1 ? "mb-4" : "mb-6"
                }`}
              >
                {paragraph}
              </p>
            ))}
            <div className="flex flex-wrap gap-2">
              {specialties.tags.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-shu-100 bg-shu-50 px-3 py-1.5 text-xs text-accent-strong"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Works */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={bioIn ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-surface rounded-3xl p-8 md:p-12 border border-line shadow-sm"
          >
            <h3 className="text-xl md:text-2xl font-bold text-sumi mb-6">{works.title}</h3>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {works.items.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-line-soft bg-sunken px-4 py-3 text-sm text-ink-soft"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-shu-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">
              {works.portfolioLabel}{" "}
              <Link href="/works" className="text-accent hover:text-accent-strong underline underline-offset-2">
                {works.portfolioLink}
              </Link>
            </p>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={bioIn ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-surface rounded-3xl p-8 md:p-12 border border-line shadow-sm"
          >
            <h3 className="text-xl md:text-2xl font-bold text-sumi mb-4">{values.title}</h3>
            <div className="space-y-4 text-ink-soft leading-relaxed text-sm md:text-base mb-6">
              {values.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <ul className="grid sm:grid-cols-2 gap-3 mb-8">
              {values.commitments.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-shu-100 bg-shu-50/70 px-4 py-3 text-sm text-accent-strong"
                >
                  <span className="text-accent font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-line bg-sunken px-6 py-5 text-sm md:text-base text-ink-soft leading-relaxed space-y-3">
              <p className="font-medium text-sumi">
                {values.concerns[0]}<br />
                {values.concerns[1]}
              </p>
              {values.closing.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-shu-600 px-6 py-3 text-sm font-semibold text-white hover:bg-shu-700 transition-colors"
              >
                {values.cta}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
