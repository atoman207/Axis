/** Main pages, in menu order. `label` is the English menu text; other languages come from the dictionary. */
export const NAV_ITEMS = [
  { key: "service", label: "SERVICE", href: "/service" },
  { key: "works", label: "WORKS", href: "/works" },
  { key: "technology", label: "TECHNOLOGY", href: "/technology" },
  { key: "about", label: "COMPANY", href: "/about" },
  { key: "career", label: "CAREERS", href: "/career" },
  { key: "contact", label: "CONTACT", href: "/contact" },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];
