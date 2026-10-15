"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useI18n } from "@/components/PreferencesProvider";
import SiteButton from "@/components/SiteButton";

const HERO_BADGES = [
  "/sites/badge/badge1.png",
  "/sites/badge/badge2.png",
  "/sites/badge/badge3.png",
  "/sites/badge/badge4.png",
  "/sites/badge/badge5.png",
] as const;

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
      className="relative isolate flex h-[100vh] min-h-[640px] items-end overflow-hidden bg-[#060d1f] pt-20 pb-14 sm:pb-16 md:pb-20 lg:pb-24"
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
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#060d1f]/70 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-6">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-7 flex items-center gap-3 text-[10px] font-semibold tracking-[0.38em] text-sky-400 uppercase sm:text-[11px]"
        >
          <span aria-hidden className="h-px w-10 bg-sky-400/90" />
          FULL-STACK AI ENGINEERING
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-[2.35rem] font-semibold leading-[1.35] tracking-[0.04em] text-white [text-shadow:0_2px_24px_rgba(6,13,31,0.45)] sm:text-5xl sm:leading-[1.3] lg:text-[3.65rem] lg:leading-[1.28]"
        >
          {t.hero.title.map((line) => (
            <span key={line} className="block">{line}</span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 max-w-xl space-y-3.5 text-[0.9375rem] font-light leading-[1.95] tracking-[0.02em] text-sky-50/75 md:text-[1.05rem] md:leading-[2]"
        >
          {t.hero.lead.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <SiteButton href="/contact" tone="onDark" className="px-8 py-3.5">
            {t.hero.ctaContact}
          </SiteButton>
          <SiteButton href="/works" tone="onDark" className="px-8 py-3.5">
            {t.hero.ctaWorks}
          </SiteButton>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-10 flex max-w-3xl flex-wrap items-center gap-3 sm:gap-4"
        >
          {HERO_BADGES.map((src, index) => (
            <li key={src} className="shrink-0">
              <Image
                src={src}
                alt={t.hero.tags[index] ?? ""}
                width={112}
                height={112}
                className="h-16 w-16 object-contain drop-shadow-lg sm:h-20 sm:w-20 md:h-[5.5rem] md:w-[5.5rem]"
              />
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
