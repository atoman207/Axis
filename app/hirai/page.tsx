import HiraiAdmin from "@/components/HiraiAdmin";

export const metadata = {
  title: "Hirai Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HiraiPage() {
  // The admin tool has its own fixed colours — keep it out of the site's theme switch.
  return (
    <div data-theme="light">
      <HiraiAdmin />
    </div>
  );
}
