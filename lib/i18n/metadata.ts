import type { Metadata } from "next";
import { dictionaries, type PageKey } from "@/lib/i18n/dictionaries";
import { getPreferences } from "@/lib/preferences/server";

/** Localized title / description for a page, following the visitor's language. */
export async function getPageMetadata(page: PageKey): Promise<Metadata> {
  const { lang } = await getPreferences();
  return dictionaries[lang].meta.pages[page];
}
