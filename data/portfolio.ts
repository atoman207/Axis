import { getSiteHeroScreenshot } from "@/lib/site-hero";

export type PortfolioCategory = {
  id: string;
  label: string;
  stacks: string[];
  sites: string[];
};

/** Technology / platform stacks shown as individual filter tabs. */
export const SKILL_CATEGORY_IDS = new Set([
  "base",
  "ec-cube",
  "makeshop",
  "next",
  "php",
  "shopify",
  "studio",
  "threejs",
  "wix",
  "wordpress",
]);

/** Industry / page-type groupings grouped under the "Other" tab. */
export const OTHER_CATEGORY_IDS = new Set([
  "ai-lp",
  "woman",
  "cloth",
  "teeth",
  "it-sites",
  "lp",
]);

export const OTHER_FILTER = "other";

const rawPortfolioCategories: PortfolioCategory[] = [
  {
    id: "ai-lp",
    label: "AI + LP",
    stacks: ["AI", "LP", "Marketing Site"],
    sites: [
      "https://www.sme-support.co.jp/",
      "https://just-c.net/",
      "https://htm-consul.com/",
      "https://www.glcl.co.jp/",
      "https://www.leapath.jp/lp_company/",
      "https://don-consultant.com/",
      "https://kirakuni-consulting.com/",
      "https://keiei-navi.com/",
      "https://www.tsuyomi.biz/",
      "https://song-cs.com/",
      "https://kinutasmec.com/",
      "https://bizdesign-partners.com/",
      "https://nkjm-smec.jp/",
    ],
  },
  {
    id: "woman",
    label: "Woman",
    stacks: ["Brand Site", "Lifestyle", "Responsive"],
    sites: [
      "https://pato.today/guest/",
      "https://aima-match.com/",
      "https://thesalon.tokyo/",
      "https://jemiremi.com/",
    ],
  },
  {
    id: "cloth",
    label: "Cloth",
    stacks: ["Fashion", "E-commerce", "UI/UX"],
    sites: [
      "https://www.muji.com/jp/ja/store",
      "https://corp.zozo.com/",
      "https://hanaya-fashion.co.jp/",
      "https://pato.today/guest/",
      "https://thesalon.tokyo/",
      "https://jemiremi.com/",
      "https://www.umeya1951.jp/",
    ],
  },
  {
    id: "wordpress",
    label: "WordPress",
    stacks: ["WordPress", "PHP", "CMS"],
    sites: [
      "https://kaho-enterprise.co.jp/",
      "https://www.every24.co.jp/",
      "https://www.apexia.biz/",
      "https://yukos.kospro.jp/",
    ],
  },
  {
    id: "studio",
    label: "STUDIO",
    stacks: ["STUDIO", "No-code", "Landing Page"],
    sites: [
      "https://crayonshinchan-japancrafts.jp/",
      "https://service.norm.co.jp/",
      "https://agel-english.com/",
      "https://aura-clinic.jp/",
      "https://x-ross.jp/",
    ],
  },
  {
    id: "shopify",
    label: "Shopify",
    stacks: ["Shopify", "E-commerce", "Liquid"],
    sites: [
      "https://store.makuake.com/",
      "https://www.kracie.co.jp/",
      "https://moon-castle.jp/",
      "https://konnybaby.jp/",
      "https://japangifts.jp/",
    ],
  },
  {
    id: "php",
    label: "PHP",
    stacks: ["PHP", "Custom Backend"],
    sites: [
      "https://x-trans.jp/",
      "https://www.sapporobeer.jp/",
    ],
  },
  {
    id: "base",
    label: "BASE",
    stacks: ["BASE", "E-commerce"],
    sites: [
      "https://busmotto.kyusanko.co.jp/",
      "https://shop.awaji-resort.com/",
      "https://shirasuya.co.jp/",
    ],
  },
  {
    id: "makeshop",
    label: "MakeShop",
    stacks: ["MakeShop", "E-commerce"],
    sites: [
      "https://morght.com/",
      "https://www.suntory.co.jp/",
      "https://www.adastria.co.jp/",
      "https://teamyokomo.com/",
    ],
  },
  {
    id: "wix",
    label: "Wix",
    stacks: ["Wix", "No-code", "Corporate Site"],
    sites: [
      "https://www.tradition-design.jp/",
      "https://www.welfing.info/",
      "https://www.webmarketing.dxup.jp/",
      "https://www.kaedehatashima.com/",
      "https://www.sijam.com/",
      "https://www.anshinlife.biz/",
      "https://www.glwa.jp/",
      "https://www.dentease.jp/",
    ],
  },
  {
    id: "next",
    label: "Next.js",
    stacks: ["Next.js", "React", "TypeScript"],
    sites: [
      "https://corp.itandi.co.jp/",
      "https://wh-sanchoku.com/",
      "https://thekitchenconnection.net/",
      "https://retouch.salon/",
      "https://retouch.news/",
      "https://i-m-service.com/",
      "https://aircon-cleannavi.com/",
    ],
  },
  {
    id: "threejs",
    label: "Three.js",
    stacks: ["Three.js", "WebGL", "Interactive"],
    sites: [
      "https://e-state.ne.jp/",
      "https://speee.jp/",
      "https://cnxt.jp/",
      "https://www.yokasumai.net/",
      "https://www.cloudot.co.jp/",
    ],
  },
  {
    id: "teeth",
    label: "Teeth",
    stacks: ["Healthcare", "LP", "WordPress/PHP"],
    sites: [
      "https://www.masuda-shika.net/lp/",
      "https://ikebukuro-mouthpiece.com/",
    ],
  },
  {
    id: "it-sites",
    label: "IT Sites",
    stacks: ["IT", "B2B", "LP"],
    sites: [
      "https://writersbox.com/ja/",
      "https://aiocr.ai/lp/",
      "https://sb-jp.com/",
      "https://usen.com/portal/biz_music/lp_uplink/",
      "https://daae.shiftinc.jp/",
    ],
  },
  {
    id: "ec-cube",
    label: "EC CUBE",
    stacks: ["EC-CUBE", "PHP", "E-commerce"],
    sites: [
      "https://www.i2-jp.com/",
      "https://www.itojuku.co.jp/",
    ],
  },
  {
    id: "lp",
    label: "LP",
    stacks: ["Landing Page", "Campaign", "Marketing"],
    sites: [
      "https://jp.rohto.com/thelypo/",
    ],
  }
];

export function getSiteName(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function sortSitesAlphabetically(sites: string[]) {
  return [...sites].sort((a, b) =>
    getSiteName(a).localeCompare(getSiteName(b), "en", { sensitivity: "base" })
  );
}

function prepareCategories(ids: Set<string>) {
  return [...rawPortfolioCategories]
    .filter((category) => ids.has(category.id))
    .sort((a, b) => a.label.localeCompare(b.label, "en", { sensitivity: "base" }))
    .map((category) => ({
      ...category,
      sites: sortSitesAlphabetically(category.sites),
    }));
}

export const skillPortfolioCategories = prepareCategories(SKILL_CATEGORY_IDS);
export const otherPortfolioCategories = prepareCategories(OTHER_CATEGORY_IDS);

/** @deprecated Use skillPortfolioCategories — kept for compatibility */
export const portfolioCategories = skillPortfolioCategories;

export function getCategoriesForFilter(activeFilter: string) {
  if (activeFilter === OTHER_FILTER) return otherPortfolioCategories;
  if (activeFilter === "all") {
    return [...skillPortfolioCategories, ...otherPortfolioCategories];
  }
  return skillPortfolioCategories.filter((category) => category.id === activeFilter);
}

export function isOtherCategory(categoryId: string) {
  return OTHER_CATEGORY_IDS.has(categoryId);
}

export function getSitePreviewImage(url: string) {
  return getSiteHeroScreenshot(url);
}

export const skillProjectCount = skillPortfolioCategories.reduce(
  (count, category) => count + category.sites.length,
  0
);

export const otherProjectCount = otherPortfolioCategories.reduce(
  (count, category) => count + category.sites.length,
  0
);

export const totalProjectCount = skillProjectCount + otherProjectCount;

export function matchesPortfolioSearch(
  site: string,
  category: PortfolioCategory,
  query: string
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    site,
    getSiteName(site),
    category.label,
    ...category.stacks,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}
