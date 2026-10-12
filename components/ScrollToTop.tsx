"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/components/PreferencesProvider";

export default function ScrollToTop() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    setVisible(false);

    const hero = document.querySelector("[data-hero-section]");
    if (!hero) {
      const handleScroll = () => setVisible(window.scrollY > 400);
      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.22 }}
          onClick={scrollToTop}
          aria-label={t.scrollTop}
          className="fixed bottom-4 right-4 z-50 flex h-12 min-w-12 items-center justify-center rounded-full border border-shu-200 bg-popover px-4 text-sm font-semibold tracking-wide text-accent-strong shadow-lg shadow-shu-100 transition hover:border-shu-300 hover:bg-shu-50 space:hover:bg-ai-900 sm:bottom-6 sm:right-6 sm:h-14 sm:min-w-14 sm:px-5"
        >
          <span aria-hidden="true" className="text-lg leading-none sm:text-xl">
            ↑
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
