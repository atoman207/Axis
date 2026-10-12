"use client";

import { useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n, useTheme } from "@/components/PreferencesProvider";
import { LANGS, type Lang } from "@/lib/preferences/config";

const LANG_LABELS: Record<Lang, { short: string; full: string }> = {
  ja: { short: "JA", full: "日本語" },
  en: { short: "EN", full: "English" },
};

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  className: "h-[18px] w-[18px]",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function PlanetIcon() {
  return (
    <svg {...ICON_PROPS} aria-hidden>
      <circle cx="12" cy="12" r="7" />
      <path d="M18.816 13.58c2.292 2.138 3.546 4 3.092 4.9c-.745 1.46-5.783-.259-11.255-3.838c-5.47-3.579-9.304-7.664-8.56-9.123c.464-.91 2.926-.444 5.803.805" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg {...ICON_PROPS} aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

/** Language switch (日本語 / English) and background switch (space / white). */
export default function PreferenceControls({ className = "" }: { className?: string }) {
  const { lang, t, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  // The controls can be mounted twice (header bar + mobile menu); keep their pills apart.
  const pillId = useId();

  const nextTheme = theme === "space" ? "light" : "space";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        role="group"
        aria-label={t.controls.language}
        className="flex h-9 items-center rounded-full border border-line bg-surface p-0.5 text-xs font-semibold tracking-wider"
      >
        {LANGS.map((code) => {
          const active = lang === code;
          return (
            <button
              key={code}
              type="button"
              lang={code}
              title={LANG_LABELS[code].full}
              aria-label={LANG_LABELS[code].full}
              aria-pressed={active}
              onClick={() => setLang(code)}
              className={`relative h-full rounded-full px-2.5 transition-colors sm:px-3 ${
                active ? "text-white" : "text-muted hover:text-sumi"
              }`}
            >
              {active && (
                <motion.span
                  layoutId={pillId}
                  className="absolute inset-0 rounded-full bg-shu-600"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{LANG_LABELS[code].short}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        title={theme === "space" ? t.controls.toLight : t.controls.toSpace}
        aria-label={theme === "space" ? t.controls.toLight : t.controls.toSpace}
        onClick={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          setTheme(nextTheme, { x: box.left + box.width / 2, y: box.top + box.height / 2 });
        }}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-line bg-surface text-sumi transition-colors hover:border-accent hover:text-accent"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.2 }}
          >
            {theme === "space" ? <PlanetIcon /> : <SunIcon />}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
