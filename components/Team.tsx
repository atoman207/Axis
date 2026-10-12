"use client";

import type { CSSProperties } from "react";
import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

function lucide(name: string) {
  return `https://cdn.jsdelivr.net/npm/lucide-static@0.469.0/icons/${name}.svg`;
}

/** The people who do the work, by role. `label` is the English eyebrow shown in every language. */
const members = [
  { id: "engineer", label: "Engineer", icon: lucide("code-xml") },
  { id: "designer", label: "Designer", icon: lucide("palette") },
] as const;

export default function Team() {
  const { t } = useI18n();

  return (
    <section id="team" className="section-padding relative scroll-mt-20 bg-band">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading eyebrow="Team" title={t.team.title} lead={t.team.lead} className="mb-12" />

        <ul className="grid gap-6 md:grid-cols-2">
          {members.map((member, i) => {
            const text = t.team.members[member.id];
            return (
              <li key={member.id}>
                <Reveal delay={0.08 * i} className="h-full rounded-3xl border border-line bg-surface p-7 shadow-sm md:p-9">
                  <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-shu-100 bg-shu-50">
                      <span
                        aria-hidden="true"
                        className="icon-mask h-6 w-6 opacity-80"
                        style={{ "--icon": `url(${member.icon})` } as CSSProperties}
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium tracking-[0.3em] text-accent uppercase">{member.label}</p>
                      <h3 className="mt-1 text-xl font-bold text-sumi">{text.role}</h3>
                    </div>
                    <div className="ml-auto flex flex-shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center">
                      <span className="rounded-full border border-line-strong px-3 py-1 text-xs text-ink-soft">{text.gender}</span>
                      <span className="rounded-full bg-ai-950 px-3 py-1 text-xs font-semibold text-white space:bg-shu-600">{t.team.headcount}</span>
                    </div>
                  </div>

                  <p className="mt-6 text-sm leading-loose text-ink-soft">{text.body}</p>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {text.areas.map((area) => (
                      <li key={area} className="rounded-full border border-shu-100 bg-shu-50 px-3 py-1.5 text-xs text-accent-strong">
                        {area}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
