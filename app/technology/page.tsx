import ContactCta from "@/components/ContactCta";
import PageHeader from "@/components/PageHeader";
import Technology from "@/components/Technology";
import { getPageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => getPageMetadata("technology");

export default function TechnologyPage() {
  return (
    <>
      <PageHeader page="technology" backgroundImage="/sites/bg/technology_bg.png" />
      <div className="page-content">
        <Technology />
      </div>
      <ContactCta />
    </>
  );
}
