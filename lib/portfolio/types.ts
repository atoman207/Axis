export type PortfolioGroupType = "skill" | "other";

export type PortfolioSite = {
  id: string;
  url: string;
  image_url: string | null;
  category_id: string;
  sort_order: number;
};

export type PortfolioCategory = {
  id: string;
  label: string;
  stacks: string[];
  group_type: PortfolioGroupType;
  sort_order: number;
  sites: PortfolioSite[];
};

export type PortfolioData = {
  categories: PortfolioCategory[];
  skillCategories: PortfolioCategory[];
  otherCategories: PortfolioCategory[];
  totalProjectCount: number;
  skillProjectCount: number;
  otherProjectCount: number;
};

export const OTHER_FILTER = "other";
