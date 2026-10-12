import type { PortfolioCategory, PortfolioData, PortfolioSite } from "@/lib/portfolio/types";
import { OTHER_FILTER } from "@/lib/portfolio/types";

export function getSiteName(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function isOtherCategory(category: Pick<PortfolioCategory, "group_type">) {
  return category.group_type === "other";
}

export function matchesPortfolioSearch(
  site: PortfolioSite,
  category: PortfolioCategory,
  query: string
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    site.url,
    getSiteName(site.url),
    category.label,
    ...category.stacks,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

export function getCategoriesForFilter(
  data: PortfolioData,
  activeFilter: string,
  searchQuery = ""
) {
  const source =
    activeFilter === OTHER_FILTER
      ? data.otherCategories
      : activeFilter === "all"
        ? data.categories
        : data.skillCategories.filter((category) => category.id === activeFilter);

  return source
    .map((category) => ({
      ...category,
      sites: category.sites.filter((site) =>
        matchesPortfolioSearch(site, category, searchQuery)
      ),
    }))
    .filter((category) => category.sites.length > 0);
}

export function buildPortfolioData(
  categories: PortfolioCategory[]
): PortfolioData {
  const skillCategories = categories.filter((category) => category.group_type === "skill");
  const otherCategories = categories.filter((category) => category.group_type === "other");
  const skillProjectCount = skillCategories.reduce(
    (count, category) => count + category.sites.length,
    0
  );
  const otherProjectCount = otherCategories.reduce(
    (count, category) => count + category.sites.length,
    0
  );

  return {
    categories,
    skillCategories,
    otherCategories,
    skillProjectCount,
    otherProjectCount,
    totalProjectCount: skillProjectCount + otherProjectCount,
  };
}
