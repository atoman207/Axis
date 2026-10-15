import Career from "@/components/Career";
import PageHeader from "@/components/PageHeader";
import { getPageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => getPageMetadata("career");

export default function CareerPage() {
  return (
    <>
      <PageHeader page="career" backgroundImage="/sites/bg/career_bg.png" />
      <div className="page-content">
        <Career />
      </div>
    </>
  );
}
