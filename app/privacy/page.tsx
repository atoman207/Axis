import PageHeader from "@/components/PageHeader";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import { getPageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => getPageMetadata("privacy");

export default function PrivacyPage() {
  return (
    <>
      <PageHeader page="privacy" />
      <div className="page-content">
        <PrivacyPolicy />
      </div>
    </>
  );
}
