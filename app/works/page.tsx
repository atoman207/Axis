import ContactCta from "@/components/ContactCta";
import PageHeader from "@/components/PageHeader";
import Works from "@/components/Works";
import { getPageMetadata } from "@/lib/i18n/metadata";
import { getPortfolio } from "@/lib/portfolio/db";

export const dynamic = "force-dynamic";

export const generateMetadata = () => getPageMetadata("works");

export default async function WorksPage() {
  const portfolio = await getPortfolio();

  return (
    <>
      <PageHeader page="works" />
      <Works portfolio={portfolio} />
      <ContactCta />
    </>
  );
}
