import ContactCta from "@/components/ContactCta";
import PageHeader from "@/components/PageHeader";
import Works from "@/components/Works";
import { getPageMetadata } from "@/lib/i18n/metadata";
import { getPortfolio } from "@/lib/portfolio/db";

/** Refresh portfolio data periodically without making every page request dynamic. */
export const revalidate = 300;

export const generateMetadata = () => getPageMetadata("works");

export default async function WorksPage() {
  const portfolio = await getPortfolio();

  return (
    <>
      <PageHeader page="works" backgroundImage="/sites/bg/work_bg.png" />
      <Works portfolio={portfolio} />
      <ContactCta />
    </>
  );
}
