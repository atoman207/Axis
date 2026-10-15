import ContactCta from "@/components/ContactCta";
import Hero from "@/components/Hero";
import HomeAbout from "@/components/HomeAbout";
import HomeCompany from "@/components/HomeCompany";
import HomeServices from "@/components/HomeServices";
import HomeProjects from "@/components/HomeProjects";
import HomeWorks, { type FeaturedWork } from "@/components/HomeWorks";
import Strengths from "@/components/Strengths";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getPortfolio } from "@/lib/portfolio/db";

/** Refresh portfolio data periodically without making every page request dynamic. */
export const revalidate = 300;

const SERVICE_COUNT = Object.keys(dictionaries.ja.services.items).length;

export default async function Home() {
  const portfolio = await getPortfolio();

  const allWorks: FeaturedWork[] = portfolio.categories.flatMap((category) =>
    category.sites.map((site) => ({ ...site, categoryLabel: category.label, stacks: category.stacks }))
  );

  return (
    <>
      <Hero />
      <HomeAbout
        stats={{
          works: portfolio.totalProjectCount,
          categories: portfolio.categories.length,
          services: SERVICE_COUNT,
        }}
      />
      <HomeServices />
      <HomeWorks works={allWorks} total={portfolio.totalProjectCount} />
      <HomeProjects />
      <Strengths />
      <HomeCompany />
      <ContactCta />
    </>
  );
}
