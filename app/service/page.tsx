import ContactCta from "@/components/ContactCta";
import PageHeader from "@/components/PageHeader";
import Services from "@/components/Services";
import { getPageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => getPageMetadata("service");

export default function ServicePage() {
  return (
    <>
      <PageHeader page="service" />
      <div className="page-content">
        <Services />
      </div>
      <ContactCta />
    </>
  );
}
