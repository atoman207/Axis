"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { COMPANY } from "@/lib/company";
import { HOME_PROJECTS, type HomeProjectId } from "@/lib/home-projects";

function AutoPlayVideo({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
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
    <video
      ref={ref}
      className="aspect-video h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      controls={false}
      disablePictureInPicture
      controlsList="nodownload nofullscreen noremoteplayback"
      aria-label={title}
    >
      <source src={src} type="video/mp4" />
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
                <Reveal delay={0.04 * i} className="h-full">
                  <article className="flex h-full flex-col overflow-hidden border border-line bg-surface shadow-sm transition-shadow hover:shadow-md">
                    <div className="relative overflow-hidden bg-ai-950">
                      <AutoPlayVideo src={project.src} title={name} />
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
                    <div className="flex flex-1 items-start px-4 py-4">
                      <h3 className="text-sm font-semibold leading-snug text-sumi md:text-[0.9375rem]">
                        {name}
                      </h3>
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
