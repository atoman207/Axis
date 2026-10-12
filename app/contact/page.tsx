import Access from "@/components/Access";
import Contact from "@/components/Contact";
import PageHeader from "@/components/PageHeader";
import { getPageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => getPageMetadata("contact");

export default function ContactPage() {
  return (
    <>
      <PageHeader page="contact" />
      <div className="page-content">
        <Contact />
      </div>
      <Access band />
    </>
  );
}
