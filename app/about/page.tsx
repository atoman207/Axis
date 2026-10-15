import About from "@/components/About";
import Access from "@/components/Access";
import CompanyInfo from "@/components/CompanyInfo";
import ContactCta from "@/components/ContactCta";
import Mission from "@/components/Mission";
import PageHeader from "@/components/PageHeader";
import Team from "@/components/Team";
import { getPageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => getPageMetadata("about");

export default function AboutPage() {
  return (
    <>
      <PageHeader page="about" backgroundImage="/sites/bg/company_bg.png" />
      <div className="page-content">
        <About />
      </div>
      <Team />
      <Mission />
      <CompanyInfo />
      <Access />
      <ContactCta />
    </>
  );
}
