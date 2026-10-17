"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import MaskLines from "@/components/motion/MaskLines";
import { useI18n } from "@/components/PreferencesProvider";
import SectionEyebrow from "@/components/SectionEyebrow";
import { EASE_OUT } from "@/lib/motion";
import type { PageKey } from "@/lib/i18n/dictionaries";

// English eyebrow shown above the localized title, in both languages.
const EYEBROWS: Record<PageKey, string> = {
  about: "Company",
  career: "Career",
  contact: "Contact",
  service: "Service",
  technology: "Technology",
  works: "Works",
  privacy: "Privacy Policy",
};

interface Props {
  page: PageKey;
  /** Optional full-bleed hero background image (e.g. /sites/bg/company_bg.png). */
  backgroundImage?: string;
}

export default function PageHeader({ page, backgroundImage }: Props) {
  const { t } = useI18n();
  const en = EYEBROWS[page];
  const { title, desc } = t.pageHeader[page];
  const onImage = Boolean(backgroundImage);

  // The photo drifts slower than the page while the header scrolls away.
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);

  return (
    <section
      ref={sectionRef}
      className={`page-header relative isolate overflow-hidden pt-32 pb-12 md:pt-40 md:pb-16 ${
        onImage ? "page-header--media border-b border-white/10" : "grid-bg border-b border-line"
      }`}
      data-hero-section
    >
      {onImage ? (
        <>
          <motion.div
            aria-hidden
            className="absolute inset-0 -z-20 bg-ai-950"
            style={reduced ? undefined : { y: photoY }}
          >
            {/* slow push-in on arrival */}
            <motion.div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${backgroundImage})` }}
              initial={{ scale: 1.12 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.4, ease: EASE_OUT }}
            />
          </motion.div>
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-r from-[#060d1f]/88 via-[#060d1f]/72 to-[#060d1f]/45"
          />
          <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 -z-10 opacity-70" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden">
            <span className="absolute inset-0 animate-[sweep-x_2.2s_cubic-bezier(0.65,0,0.35,1)_0.5s_both] bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
          </div>
        </>
      ) : (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-shu-100/50 blur-[140px]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          aria-label="Breadcrumb"
          className={`mb-8 flex items-center gap-2 text-[11px] tracking-wider ${
            onImage ? "text-white/55" : "text-faint"
          }`}
        >
          <Link
            href="/"
            className={onImage ? "transition-colors hover:text-white" : "transition-colors hover:text-sumi"}
          >
            HOME
          </Link>
          <span className={onImage ? "text-white/35" : "text-ghost"}>/</span>
          <span className={onImage ? "text-sky-300" : "text-accent"}>{en.toUpperCase()}</span>
        </motion.nav>

        <SectionEyebrow delay={0.06} tone={onImage ? "onDark" : "default"}>
          {en}
        </SectionEyebrow>

        <h1
          className={`mb-5 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl ${
            onImage ? "!text-white" : "text-sumi"
          }`}
        >
          <MaskLines lines={[title]} trigger="mount" delay={0.15} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: EASE_OUT }}
          className={`max-w-2xl text-sm leading-loose md:text-base ${
            onImage ? "!text-white/85" : "text-muted"
          }`}
        >
          {desc}
        </motion.p>
      </div>
    </section>
  );
}
