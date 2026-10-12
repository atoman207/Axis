"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/components/PreferencesProvider";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const play = () => {
      video.play().catch(() => {});
    };
    play();
    video.addEventListener("ended", play);
    return () => video.removeEventListener("ended", play);
  }, []);

  return (
    <section
      id="home"
      data-hero-section
      className="relative isolate flex min-h-[640px] items-center overflow-hidden bg-[#060d1f] pt-16 sm:pt-18 lg:min-h-[88vh] lg:pt-20"
    >
      <video
        ref={videoRef}
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        aria-hidden
      >
        <source src="/ai-engineer-01-morning.mp4" type="video/mp4" />
      </video>

      {/* navy scrim: keeps the copy readable over the footage in either theme */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-[#060d1f]/95 via-[#060d1f]/75 to-[#060d1f]/25" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-[#060d1f]/60 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-24">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6 flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] text-sky-300 uppercase sm:text-xs"
        >
          <span aria-hidden className="h-px w-8 bg-sky-300" />
          Full-Stack AI Engineering Team
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="text-[2.1rem] font-bold leading-[1.3] text-white sm:text-5xl sm:leading-[1.25] lg:text-6xl lg:leading-[1.25]"
        >
          {t.hero.title.map((line) => (
            <span key={line} className="block">{line}</span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-7 max-w-xl text-sm leading-loose text-white/85 md:text-base"
        >
          {t.hero.lead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-shu-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-shu-500"
          >
            {t.hero.ctaContact}
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/works"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
          >
            {t.hero.ctaWorks}
          </Link>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-10 flex max-w-2xl flex-wrap gap-2"
        >
          {t.hero.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] tracking-wide text-white/80 backdrop-blur-sm sm:text-xs"
            >
              {tag}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
