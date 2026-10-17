"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import MaskLines from "@/components/motion/MaskLines";
import WaveEdge from "@/components/motion/WaveEdge";
import { useI18n } from "@/components/PreferencesProvider";
import SiteButton from "@/components/SiteButton";
import { EASE_OUT } from "@/lib/motion";

const HERO_BADGES = [
  "/sites/badge/badge1.png",
  "/sites/badge/badge2.png",
  "/sites/badge/badge3.png",
  "/sites/badge/badge4.png",
  "/sites/badge/badge5.png",
] as const;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef(0);
  const { t } = useI18n();
  const reduced = useReducedMotion();

  // Scrolling away: the footage pushes in slightly while the copy drifts up and fades.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    // Reduced motion: hold the first frame instead of looping footage.
    if (reduced) {
      video.pause();
      return;
    }
    const play = () => {
      video.play().catch(() => {});
    };
    play();
    video.addEventListener("ended", play);
    return () => video.removeEventListener("ended", play);
  }, [reduced]);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const section = sectionRef.current;
    if (!section || event.pointerType !== "mouse") return;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      section.style.setProperty("--sx", `${clientX - rect.left}px`);
      section.style.setProperty("--sy", `${clientY - rect.top}px`);
      section.dataset.spotlight = "on";
    });
  };

  const handlePointerLeave = () => {
    cancelAnimationFrame(frameRef.current);
    if (sectionRef.current) sectionRef.current.dataset.spotlight = "off";
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      data-hero-section
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative isolate flex h-[100vh] min-h-[640px] items-end overflow-hidden bg-[#060d1f] pt-20 pb-14 sm:pb-16 md:pb-20 lg:pb-24"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={reduced ? undefined : { scale: videoScale }}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
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
      </motion.div>

      {/* navy scrim: keeps the copy readable over the footage in either theme */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-[#060d1f]/95 via-[#060d1f]/75 to-[#060d1f]/25" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#060d1f]/70 to-transparent" />

      {/* atmosphere: a faint engineering grid, slow blue/violet light, and a cursor spotlight */}
      <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="aurora absolute -left-[10%] top-[18%] h-[46vmax] w-[46vmax] rounded-full bg-shu-500/20 blur-[110px]" />
        <div className="aurora aurora--slow absolute -bottom-[20%] left-[30%] h-[40vmax] w-[40vmax] rounded-full bg-violet-600/16 blur-[120px]" />
      </div>
      <div aria-hidden className="hero-spotlight pointer-events-none absolute inset-0 -z-10" />

      <motion.div
        className="mx-auto w-full max-w-7xl px-6"
        style={reduced ? undefined : { y: copyY, opacity: copyOpacity }}
      >
        <p className="mb-7 flex items-center gap-3 text-[10px] font-semibold tracking-[0.38em] text-sky-400 uppercase sm:text-[11px]">
          <motion.span
            aria-hidden
            className="h-px w-10 origin-left bg-gradient-to-r from-sky-300 to-violet-400"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE_OUT }}
          />
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE_OUT }}
          >
            FULL-STACK AI ENGINEERING
          </motion.span>
        </p>

        <h1 className="font-serif text-[2.35rem] font-semibold leading-[1.35] tracking-[0.04em] text-white [text-shadow:0_2px_24px_rgba(6,13,31,0.45)] sm:text-5xl sm:leading-[1.3] lg:text-[3.65rem] lg:leading-[1.28]">
          <MaskLines lines={t.hero.title} trigger="mount" delay={0.25} stagger={0.14} />
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE_OUT }}
          className="mt-8 max-w-xl space-y-3.5 text-[0.9375rem] font-light leading-[1.95] tracking-[0.02em] text-sky-50/75 md:text-[1.05rem] md:leading-[2]"
        >
          {t.hero.lead.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: EASE_OUT }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <SiteButton href="/contact" tone="onDark" className="px-8 py-3.5">
            {t.hero.ctaContact}
          </SiteButton>
          <SiteButton href="/works" tone="onDark" className="px-8 py-3.5">
            {t.hero.ctaWorks}
          </SiteButton>
        </motion.div>

        <ul className="mt-10 flex max-w-3xl flex-wrap items-center gap-3 sm:gap-4">
          {HERO_BADGES.map((src, index) => (
            <motion.li
              key={src}
              className="shrink-0"
              initial={{ opacity: 0, y: 14, scale: 0.86 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.9 + index * 0.07, ease: EASE_OUT }}
            >
              <Image
                src={src}
                alt={t.hero.tags[index] ?? ""}
                width={112}
                height={112}
                className="h-16 w-16 object-contain drop-shadow-lg transition-transform duration-500 ease-out hover:-translate-y-1 hover:scale-105 sm:h-20 sm:w-20 md:h-[5.5rem] md:w-[5.5rem]"
              />
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* scroll cue — a light falling down a hairline */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="pointer-events-none absolute right-6 bottom-24 hidden flex-col items-center gap-3 md:flex lg:right-10 space:bottom-10"
      >
        <span className="text-[10px] font-semibold tracking-[0.32em] text-white/55 [writing-mode:vertical-rl]">SCROLL</span>
        <span className="relative h-16 w-px overflow-hidden bg-white/15">
          <span className="absolute inset-x-0 top-0 h-1/3 animate-[scroll-cue_2.2s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-gradient-to-b from-transparent via-sky-300 to-violet-300" />
        </span>
      </motion.div>

      {/* the footage gives way to the page in a slow, layered swell */}
      <WaveEdge edge="bottom" className="z-10 h-10 md:h-16 lg:h-20" />
    </section>
  );
}
