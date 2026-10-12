"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { dictionaries, type Dictionary } from "@/lib/i18n/dictionaries";
import {
  LANG_COOKIE,
  PREFERENCE_MAX_AGE,
  THEME_COOKIE,
  type Lang,
  type Theme,
} from "@/lib/preferences/config";

type Point = { x: number; y: number };

type Preferences = {
  lang: Lang;
  theme: Theme;
  t: Dictionary;
  setLang: (lang: Lang) => void;
  /** `origin` is where the circular reveal starts (usually the toggle button). */
  setTheme: (theme: Theme, origin?: Point) => void;
};

const PreferencesContext = createContext<Preferences | null>(null);

const REVEAL_CLASS = "theme-reveal";

function savePreference(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${PREFERENCE_MAX_AGE}; samesite=lax`;
}

type Props = {
  initialLang: Lang;
  initialTheme: Theme;
  children: React.ReactNode;
};

export default function PreferencesProvider({ initialLang, initialTheme, children }: Props) {
  const router = useRouter();
  const [lang, setLangState] = useState(initialLang);
  const [theme, setThemeState] = useState(initialTheme);

  const setLang = useCallback(
    (next: Lang) => {
      setLangState(next);
      savePreference(LANG_COOKIE, next);
      document.documentElement.lang = next;
      // Server-rendered pieces (page <title>, meta description) follow the cookie.
      router.refresh();
    },
    [router]
  );

  const setTheme = useCallback((next: Theme, origin?: Point) => {
    const root = document.documentElement;
    const apply = () => {
      setThemeState(next);
      root.dataset.theme = next;
    };

    savePreference(THEME_COOKIE, next);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof document.startViewTransition !== "function" || reducedMotion) {
      apply();
      return;
    }

    // Grow the new theme out of the toggle like a portal opening.
    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? 0;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.style.setProperty("--reveal-x", `${x}px`);
    root.style.setProperty("--reveal-y", `${y}px`);
    root.style.setProperty("--reveal-r", `${radius}px`);
    root.classList.add(REVEAL_CLASS);

    const transition = document.startViewTransition(() => flushSync(apply));
    transition.finished.finally(() => root.classList.remove(REVEAL_CLASS));
  }, []);

  const value = useMemo<Preferences>(
    () => ({ lang, theme, t: dictionaries[lang], setLang, setTheme }),
    [lang, theme, setLang, setTheme]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return value;
}

export function useI18n() {
  const { lang, t, setLang } = usePreferences();
  return { lang, t, setLang };
}

export function useTheme() {
  const { theme, setTheme } = usePreferences();
  return { theme, setTheme };
}
