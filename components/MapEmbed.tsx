"use client";

import { useI18n } from "@/components/PreferencesProvider";
import { googleMapEmbedUrl } from "@/lib/company";

/** Google Map of the office. Sized by the caller through `className`. */
export default function MapEmbed({ className = "" }: { className?: string }) {
  const { lang, t } = useI18n();

  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-sunken ${className}`}>
      <iframe
        src={googleMapEmbedUrl(lang)}
        title={t.access.mapTitle}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        // the map tiles are drawn light; in the space theme they are dimmed to sit with the page
        className="block h-full w-full border-0 space:opacity-90 space:[filter:grayscale(0.2)_brightness(0.92)]"
      />
    </div>
  );
}
