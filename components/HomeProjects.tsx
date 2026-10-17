"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import ClipReveal from "@/components/motion/ClipReveal";
import TiltCard from "@/components/motion/TiltCard";
import { useI18n } from "@/components/PreferencesProvider";
import SectionHeading from "@/components/SectionHeading";
import { COMPANY } from "@/lib/company";
import { HOME_PROJECTS, type HomeProjectId } from "@/lib/home-projects";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Plays only while on screen — four looping videos would otherwise keep decoding
 * off-screen and drain phones. Reduced motion shows a still frame instead.
 */
function AutoPlayVideo({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    if (prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "120px 0px" }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="aspect-video h-full w-full object-cover transition-[scale] duration-700 ease-out group-hover:scale-[1.06]"
      muted
      loop
      playsInline
      preload="metadata"
      controls={false}
      disablePictureInPicture
      controlsList="nodownload nofullscreen noremoteplayback"
      aria-label={title}
    >
      {/* #t: show a real first frame before playback starts (iOS shows black otherwise) */}
      <source src={`${src}#t=0.1`} type="video/mp4" />
    </video>
  );
}

/** Project demo videos in a 4-column card grid on desktop. */
export default function HomeProjects() {
  const { t } = useI18n();
  const copy = t.home.projects;

  return (
    <section className="section-padding relative bg-band">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Project" title={copy.title} lead={copy.lead} className="mb-12" />

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_PROJECTS.map((project, i) => {
            const name = copy.names[project.id as HomeProjectId];
            return (
              <li key={project.id}>
                <ClipReveal delay={0.08 * (i % 4)} className="h-full">
                  <TiltCard max={5} className="h-full">
                    <article className="group flex h-full flex-col overflow-hidden border border-line bg-surface shadow-sm transition-shadow duration-500 hover:shadow-[0_28px_56px_-30px_rgba(47,111,242,0.6),0_14px_32px_-22px_rgba(139,92,246,0.45)]">
                      <div className="relative overflow-hidden bg-ai-950">
                        <AutoPlayVideo src={project.src} title={name} />
                        {/* a cool wash of light across the footage on hover */}
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-shu-600/0 via-sky-400/0 to-violet-500/0 transition-colors duration-700 group-hover:from-shu-600/25 group-hover:to-violet-500/20"
                        />
                        <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center overflow-hidden bg-[#00040e] ring-1 ring-white/20 sm:h-9 sm:w-9">
                          <Image
                            src={COMPANY.logo}
                            alt={COMPANY.brand}
                            width={36}
                            height={36}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </div>
                      <div className="relative flex flex-1 items-start px-4 py-4">
                        <span
                          aria-hidden
                          className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-shu-500 via-sky-400 to-violet-500 transition-transform duration-700 ease-out group-hover:scale-x-100"
                        />
                        <h3 className="text-sm font-semibold leading-snug text-sumi transition-colors duration-300 group-hover:text-accent-strong md:text-[0.9375rem]">
                          {name}
                        </h3>
                      </div>
                    </article>
                  </TiltCard>
                </ClipReveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
