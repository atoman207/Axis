export const LANGS = ["ja", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "ja";
export const LANG_COOKIE = "axis-lang";

export const THEMES = ["space", "light"] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "light";
export const THEME_COOKIE = "axis-theme";

/** One year — preferences should survive between visits. */
export const PREFERENCE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseLang(value: string | undefined | null): Lang {
  return LANGS.includes(value as Lang) ? (value as Lang) : DEFAULT_LANG;
}

export function parseTheme(value: string | undefined | null): Theme {
  return THEMES.includes(value as Theme) ? (value as Theme) : DEFAULT_THEME;
}
