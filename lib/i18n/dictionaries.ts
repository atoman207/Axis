import type { Lang } from "@/lib/preferences/config";
import ja, { type Dictionary } from "@/lib/i18n/ja";
import en from "@/lib/i18n/en";

export type { Dictionary };

export const dictionaries: Record<Lang, Dictionary> = { ja, en };

export type PageKey = keyof Dictionary["pageHeader"];
