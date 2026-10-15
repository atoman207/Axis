import type { Metadata } from "next";
import { dictionaries, type PageKey } from "@/lib/i18n/dictionaries";
import { DEFAULT_LANG } from "@/lib/preferences/config";

/**
 * Localized title / description for a page.
 * Uses the default language at build time so pages stay static on the Hobby plan
 * (reading cookies in metadata would force every route dynamic).
 */
export async function getPageMetadata(page: PageKey): Promise<Metadata> {
  return dictionaries[DEFAULT_LANG].meta.pages[page];
}
