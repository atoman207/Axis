import { cookies } from "next/headers";
import {
  LANG_COOKIE,
  THEME_COOKIE,
  parseLang,
  parseTheme,
  type Lang,
  type Theme,
} from "@/lib/preferences/config";

/**
 * Reads the visitor's saved language / theme from cookies so the very first
 * HTML response is already in the right language and colour — no flash.
 */
export async function getPreferences(): Promise<{ lang: Lang; theme: Theme }> {
  const store = await cookies();
  return {
    lang: parseLang(store.get(LANG_COOKIE)?.value),
    theme: parseTheme(store.get(THEME_COOKIE)?.value),
  };
}
