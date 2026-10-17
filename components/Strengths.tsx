"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { EASE_OUT } from "@/lib/motion";

export default function Strengths() {
  const { t } = useI18n();
  const copy = t.home.strengths;

  return (
    <section className="section-padding relative bg-band">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Strength" title={copy.title} className="mb-12" />

        <ol className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
          {copy.items.map((item, i) => (
            <motion.li
              key={item.title}
              className="group relative border-t border-line-strong"
              initial="hidden"
              whileInView="shown"
              viewport={{ once: true, margin: "-60px" }}
            >
              {/* a blue→violet light draws along the rule as the item arrives */}
              <motion.span
                aria-hidden
                className="absolute inset-x-0 -top-px h-px origin-left bg-gradient-to-r from-shu-500 via-sky-400 to-violet-500/0"
                variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
                transition={{ duration: 1.2, delay: 0.1 + 0.08 * i, ease: EASE_OUT }}
              />
              <Reveal delay={0.06 * i} className="flex gap-6 py-8 md:py-10">
                <span className="gradient-text text-3xl font-bold leading-none transition-[filter] duration-500 group-hover:drop-shadow-[0_0_14px_rgba(139,92,246,0.45)] md:text-4xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-sumi transition-colors duration-300 group-hover:text-accent-strong md:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-loose text-muted">{item.body}</p>
                </div>
              </Reveal>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
