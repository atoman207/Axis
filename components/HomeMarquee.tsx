"use client";

import VelocityMarquee from "@/components/motion/VelocityMarquee";
import { useI18n } from "@/components/PreferencesProvider";
import { services } from "@/components/Services";

/** The service lines and specialities, sliding past with the scroll. */
export default function HomeMarquee() {
  const { t } = useI18n();
  return <VelocityMarquee primary={services.map((service) => service.title)} secondary={t.hero.tags} />;
}
