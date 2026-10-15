"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
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

        <ul className="grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const text = t.services.items[service.id];
            return (
              <li key={service.id} className="relative min-h-[260px] overflow-hidden bg-surface">
                <Reveal delay={0.05 * i} className="h-full">
                  <Link href="/service" className="group relative flex h-full min-h-[260px] flex-col overflow-hidden">
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${service.bgSrc})` }}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-[#060d1f]/92 via-[#060d1f]/70 to-[#060d1f]/30"
                    />

                    <div className="relative z-10 flex h-full flex-col p-7 md:p-8">
                      <div className="mb-6 flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-[0.2em] text-white/55">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          aria-hidden
                          className="icon-mask h-6 w-6 opacity-90 transition-transform duration-300 group-hover:scale-110"
                          style={{ "--icon": `url(${service.iconSrc})`, backgroundColor: "#ffffff" } as CSSProperties}
                        />
                      </div>
                      <h3 className="text-lg font-bold text-white">{service.title}</h3>
                      {text.subtitle && (
                        <p className="mt-1 text-xs tracking-wide text-sky-200/90">{text.subtitle}</p>
                      )}
                      <p className="mt-4 text-sm leading-loose text-white/80">{text.description}</p>
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
