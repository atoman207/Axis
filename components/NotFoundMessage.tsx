"use client";

import { useI18n } from "@/components/PreferencesProvider";
import SiteButton from "@/components/SiteButton";

export default function NotFoundMessage() {
  const { t } = useI18n();

  return (
    <section data-hero-section className="grid-bg flex min-h-[70vh] items-center px-6 pt-32 pb-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="gradient-text text-6xl font-bold md:text-7xl">404</p>
        <h1 className="mt-6 text-2xl font-bold text-sumi md:text-3xl">{t.notFound.title}</h1>
        <p className="mt-4 text-sm leading-loose text-muted md:text-base">{t.notFound.body}</p>
        <SiteButton href="/" className="mt-8 px-7 py-3.5">
          {t.notFound.back}
        </SiteButton>
      </div>
    </section>
  );
}
