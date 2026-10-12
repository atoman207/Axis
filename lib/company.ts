/** Company facts shared by every page. Wording that changes with the language lives in the dictionaries. */
export const COMPANY = {
  name: "株式会社アクシス",
  brand: "AXIS",
  representative: "永井　将司",
  address: "東京都港区浜松町2-2-15-2F",
  addressEn: "2F, 2-2-15 Hamamatsucho, Minato-ku, Tokyo, Japan",
  logo: "/propile_avatar.png",
  lancersUrl: "https://www.lancers.jp/profile/axis1144",
  lancersLabel: "lancers.jp/profile/axis1144",
} as const;

// The pin is placed by street address; the floor is left out so Google resolves the building.
const MAP_QUERY = encodeURIComponent("東京都港区浜松町2-2-15");

/** Keyless Google Maps embed. */
export function googleMapEmbedUrl(lang: string) {
  return `https://www.google.com/maps?q=${MAP_QUERY}&z=16&hl=${lang}&output=embed`;
}

export const GOOGLE_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;
