"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import TiltCard from "@/components/motion/TiltCard";
import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import SiteButton from "@/components/SiteButton";
import { services } from "@/components/Services";

/** The service menu in brief; the full cards live on /service. */
export default function HomeServices() {
  const { t } = useI18n();
  const copy = t.home.services;

  return (
    <section className="section-padding relative bg-band">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Service" title={copy.title} lead={copy.lead} />
          <Reveal delay={0.1}>
            <SiteButton href="/service">{copy.link}</SiteButton>
          </Reveal>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {services.map((service, i) => {
            const text = t.services.items[service.id];
            return (
              <li key={service.id} className="min-h-[260px]">
                <Reveal delay={0.06 * i} y={40} className="h-full">
                  <TiltCard
                    max={6}
                    className="group h-full border border-line bg-surface transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(47,111,242,0.6),0_16px_36px_-24px_rgba(139,92,246,0.5)]"
                  >
                    <Link
                      href="/service"
                      className="relative flex h-full min-h-[260px] flex-col [transform-style:preserve-3d] focus-visible:outline-none"
                    >
                      <div aria-hidden className="absolute inset-0 overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                          style={{ backgroundImage: `url(${service.bgSrc})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#060d1f]/92 via-[#060d1f]/70 to-[#060d1f]/30" />
                        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_125%,rgba(47,111,242,0.5),rgba(139,92,246,0.18)_45%,transparent_70%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                      </div>

                      <div className="relative z-10 flex h-full flex-col p-7 [transform-style:preserve-3d] md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                          <span className="text-xs font-semibold tracking-[0.2em] text-white/55 transition-colors duration-300 group-hover:text-sky-200">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {/* glow lives on the wrapper: a filter on the masked icon would be clipped by its own mask */}
                          <span
                            aria-hidden
                            className="flex transition-[filter] duration-500 [transform:translateZ(32px)] group-hover:drop-shadow-[0_0_10px_rgba(125,211,252,0.85)]"
                          >
                            <span
                              className="icon-mask h-6 w-6 opacity-90"
                              style={{ "--icon": `url(${service.iconSrc})`, backgroundColor: "#ffffff" } as CSSProperties}
                            />
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white">{service.title}</h3>
                        {text.subtitle && (
                          <p className="mt-1 text-xs tracking-wide text-sky-200/90">{text.subtitle}</p>
                        )}
                        <p className="mt-4 text-sm leading-loose text-white/80">{text.description}</p>
                        <span
                          aria-hidden
                          className="mt-auto flex items-center gap-1 pt-6 text-xs text-sky-200 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                        >
                          {t.services.more} →
                        </span>
                      </div>
                    </Link>
                  </TiltCard>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
