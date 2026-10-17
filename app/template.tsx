import PageTransition from "@/components/motion/PageTransition";

/** Templates remount on navigation — the hook for the page-to-page transition. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
