"use client";

import { useI18n } from "@/components/PreferencesProvider";
import SiteButton from "@/components/SiteButton";

export default function PrivacyPolicy() {
  const { t } = useI18n();
  const policy = t.privacy;

  return (
    <section className="section-padding relative">
      <div className="mx-auto max-w-3xl px-6">
        <p className="text-sm leading-loose text-ink-soft md:text-base">{policy.intro}</p>

        <div className="mt-12 space-y-10">
          {policy.sections.map((section) => (
            <div key={section.title}>
              <h2 className="border-l-4 border-accent pl-4 text-lg font-bold md:text-xl">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-loose text-ink-soft md:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-line pt-8">
          <SiteButton href="/contact">{policy.contactLink}</SiteButton>
        </div>
      </div>
    </section>
  );
}
