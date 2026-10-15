"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type CSSProperties } from "react";
import { useI18n } from "@/components/PreferencesProvider";
import SectionEyebrow from "@/components/SectionEyebrow";

function lucide(name: string) {
  return `https://cdn.jsdelivr.net/npm/lucide-static@0.469.0/icons/${name}.svg`;
}

/** Card backgrounds — numbered assets mapped in reverse (1st card → 6, …, 6th → 1). */
const values = [
  {
    key: "innovation",
    title: "Innovation",
    icon: lucide("zap"),
    bgSrc: "/skillcard/value-6.png",
  },
  {
    key: "quality",
    title: "Quality",
    icon: lucide("badge-check"),
    bgSrc: "/skillcard/value-5.png",
  },
  {
    key: "trust",
    title: "Trust",
    icon: lucide("handshake"),
    bgSrc: "/skillcard/value-4.png",
  },
  {
    key: "speed",
    title: "Speed",
    icon: lucide("gauge"),
    bgSrc: "/skillcard/value-3.png",
  },
  {
    key: "ownership",
    title: "Ownership",
    icon: lucide("crown"),
    bgSrc: "/skillcard/value-2.png",
  },
  {
    key: "learning",
    title: "Continuous Learning",
    icon: lucide("graduation-cap"),
    bgSrc: "/skillcard/value-1.png",
  },
] as const;

export default function Mission() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { t } = useI18n();

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-shu-100/40 rounded-full blur-[120px]" />
      </div>

      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Mission */}
        <div className="mb-14 text-center sm:mb-18 md:mb-24">
          <SectionEyebrow align="center">Mission</SectionEyebrow>
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mx-auto max-w-5xl text-xl font-bold leading-tight text-sumi sm:whitespace-nowrap sm:text-3xl md:text-5xl"
          >
            {t.mission.headingLead}
            <span className="gradient-text">{t.mission.headingAccent}</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl space-y-4 text-sm leading-relaxed text-muted sm:mt-6 md:text-base"
          >
            {t.mission.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </motion.div>
        </div>

        {/* Vision */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative mb-14 overflow-hidden rounded-3xl border border-shu-100 bg-surface p-6 text-center shadow-sm sm:mb-18 sm:p-8 md:mb-24 md:p-16"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-shu-50/60 to-gold-50/30" />
          <SectionEyebrow align="center" className="relative">Vision</SectionEyebrow>
          <p className="relative text-xl font-bold leading-relaxed text-sumi sm:text-2xl md:text-4xl">
            {t.mission.visionLead}
            <span className="gradient-text">{t.mission.visionAccent}</span>
            {t.mission.visionTail}
          </p>
          <div className="relative mx-auto mt-5 max-w-2xl space-y-4 text-sm leading-relaxed text-muted sm:mt-6 md:text-base">
            {t.mission.visionBody.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </motion.div>

        {/* Values */}
        <div>
          <SectionEyebrow align="center" delay={0.25}>Value</SectionEyebrow>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.07 }}
                className="group relative min-h-[220px] overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:shadow-md sm:min-h-[240px]"
              >
                <div
                  aria-hidden
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${v.bgSrc})` }}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-[#060d1f]/90 via-[#060d1f]/68 to-[#060d1f]/30"
                />

                <div className="relative z-10 flex h-full flex-col p-5 sm:p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-white/10 backdrop-blur-sm">
                    <span
                      aria-hidden="true"
                      className="icon-mask h-5 w-5 opacity-90"
                      style={{ "--icon": `url(${v.icon})`, backgroundColor: "#ffffff" } as CSSProperties}
                    />
                  </div>
                  <h3 className="mb-2 font-semibold text-white">{v.title}</h3>
                  <p className="text-sm leading-relaxed text-white/80">{t.mission.values[v.key]}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
