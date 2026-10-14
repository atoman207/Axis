"use client";

import MapEmbed from "@/components/MapEmbed";
import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import SiteButton from "@/components/SiteButton";
import { COMPANY, GOOGLE_MAP_URL } from "@/lib/company";

/** Office address, nearest stations and the Google Map. */
export default function Access({ band = false }: { band?: boolean }) {
  const { t } = useI18n();

  return (
    <section id="access" className={`section-padding relative scroll-mt-20 ${band ? "bg-band" : ""}`}>
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="Access" title={t.access.title} className="mb-10" />

        <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
          <Reveal className="lg:col-span-2">
            <dl className="space-y-6 text-sm">
              <div>
                <dt className="mb-1.5 font-semibold text-sumi">{t.access.addressLabel}</dt>
                <dd className="leading-relaxed text-ink-soft">
                  {COMPANY.name}
                  <br />
                  {t.access.address}
                </dd>
              </div>
              <div>
                <dt className="mb-1.5 font-semibold text-sumi">{t.access.stationsLabel}</dt>
                <dd className="text-ink-soft">
                  <ul className="space-y-1.5 leading-relaxed">
                    {t.access.stations.map((station) => (
                      <li key={station} className="flex gap-2">
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-shu-500" />
                        {station}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>

            <SiteButton href={GOOGLE_MAP_URL} external className="mt-8 px-5 py-2.5">
              {t.access.openMap}
            </SiteButton>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <MapEmbed className="h-[320px] sm:h-[400px]" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
