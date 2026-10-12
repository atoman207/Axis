"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type CSSProperties } from "react";
import { useI18n } from "@/components/PreferencesProvider";

function lucide(name: string) {
  return `https://cdn.jsdelivr.net/npm/lucide-static@0.469.0/icons/${name}.svg`;
}

const values = [
  { key: "innovation", title: "Innovation",          icon: lucide("zap"),            border: "border-shu-100",  from: "from-shu-50"  },
  { key: "quality",    title: "Quality",             icon: lucide("badge-check"),    border: "border-gold-200", from: "from-gold-50" },
  { key: "trust",      title: "Trust",               icon: lucide("handshake"),      border: "border-ai-100",   from: "from-ai-50"   },
  { key: "speed",      title: "Speed",               icon: lucide("gauge"),          border: "border-shu-100",  from: "from-shu-50"  },
  { key: "ownership",  title: "Ownership",           icon: lucide("crown"),          border: "border-shu-100",  from: "from-shu-50"  },
  { key: "learning",   title: "Continuous Learning", icon: lucide("graduation-cap"), border: "border-ai-200",   from: "from-ai-50"   },
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
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} className="text-xs tracking-[0.3em] text-accent mb-4 uppercase">Mission</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mx-auto max-w-3xl text-2xl font-bold leading-tight text-sumi sm:text-3xl md:text-5xl"
          >
            {t.mission.headingLead}<span className="gradient-text">{t.mission.headingAccent}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:mt-6 md:text-base"
          >
            {t.mission.body[0]}<br />{t.mission.body[1]}
          </motion.p>
        </div>

        {/* Vision */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative mb-14 overflow-hidden rounded-3xl border border-shu-100 bg-surface p-6 text-center shadow-sm sm:mb-18 sm:p-8 md:mb-24 md:p-16"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-shu-50/60 to-gold-50/30" />
          <p className="relative text-xs tracking-[0.3em] text-accent-alt mb-4 uppercase">Vision</p>
          <p className="relative text-xl font-bold leading-relaxed text-sumi sm:text-2xl md:text-4xl">
            {t.mission.visionLead}<br />
            <span className="gradient-text">{t.mission.visionAccent}</span>
            <span className="text-sumi">{t.mission.visionTail}</span>
          </p>
        </motion.div>

        {/* Values */}
        <div>
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.4 }} className="text-xs tracking-[0.3em] text-accent mb-4 uppercase text-center">Value</motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.07 }}
                className={`rounded-2xl border bg-surface p-5 transition-all duration-300 hover:shadow-md sm:p-6 ${v.border}`}
              >
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border bg-gradient-to-br to-transparent ${v.from} ${v.border}`}>
                  <span
                    aria-hidden="true"
                    className="icon-mask h-5 w-5 opacity-80"
                    style={{ "--icon": `url(${v.icon})` } as CSSProperties}
                  />
                </div>
                <h3 className="text-sumi font-semibold mb-2">{v.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{t.mission.values[v.key]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
