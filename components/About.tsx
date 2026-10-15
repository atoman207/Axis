"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useI18n } from "@/components/PreferencesProvider";
import SectionHeading from "@/components/SectionHeading";
import { COMPANY } from "@/lib/company";

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { t } = useI18n();

  return (
    <section id="about" className="section-padding relative scroll-mt-20 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-shu-50 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div ref={ref} className="mx-auto max-w-3xl text-left">
          <SectionHeading eyebrow="Message" title={t.about.title} className="mb-10" />
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-5 text-left text-sm leading-loose text-ink-soft md:text-base"
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
                <span className="text-xl font-bold tracking-wide text-sumi md:text-2xl">
                  {COMPANY.representative}
                </span>
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
