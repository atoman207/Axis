"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/components/PreferencesProvider";
import SectionEyebrow from "@/components/SectionEyebrow";
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
}

export default function PageHeader({ page }: Props) {
  const { t } = useI18n();
  const en = EYEBROWS[page];
  const { title, desc } = t.pageHeader[page];

  return (
    <section className="page-header relative pt-32 pb-12 overflow-hidden grid-bg border-b border-line md:pt-40 md:pb-16" data-hero-section>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-shu-100/50 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[11px] text-faint mb-8 tracking-wider"
        >
          <Link href="/" className="hover:text-sumi transition-colors">HOME</Link>
          <span className="text-ghost">/</span>
          <span className="text-accent">{en.toUpperCase()}</span>
        </motion.nav>

        <SectionEyebrow delay={0.06}>{en}</SectionEyebrow>

        {/* Page title */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-sumi leading-tight mb-5"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="text-muted text-sm md:text-base max-w-2xl leading-loose"
        >
          {desc}
        </motion.p>
      </div>
    </section>
  );
}
