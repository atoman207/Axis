"use client";

import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

export default function Strengths() {
  const { t } = useI18n();
  const copy = t.home.strengths;

  return (
    <section className="section-padding relative bg-band">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Strength" title={copy.title} className="mb-12" />

        <ol className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
          {copy.items.map((item, i) => (
            <li key={item.title} className="border-t border-line-strong">
              <Reveal delay={0.06 * i} className="flex gap-6 py-8 md:py-10">
                <span className="gradient-text text-3xl font-bold leading-none md:text-4xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-sumi md:text-xl">{item.title}</h3>
                  <p className="mt-3 text-sm leading-loose text-muted">{item.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
