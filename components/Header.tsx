"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PreferenceControls from "@/components/PreferenceControls";
import { useI18n } from "@/components/PreferencesProvider";
import SiteButton from "@/components/SiteButton";
import SiteLogo from "@/components/SiteLogo";
import { NAV_ITEMS } from "@/lib/navigation";

// Contact is the button on the right, not a text link.
const textLinks = NAV_ITEMS.filter((item) => item.key !== "contact");

export default function Header() {
  const pathname = usePathname();
  // remembered as the page it was opened on, so moving to another page closes it
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === pathname;
  const { lang, t } = useI18n();
  const showJa = lang === "ja";

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-chrome backdrop-blur-sm border-b border-line space:backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:h-18 sm:px-6 md:px-8 lg:h-20">
          <Link href="/" aria-label={t.header.home} className="flex items-center flex-shrink-0">
            <SiteLogo eager />
          </Link>

          <nav className="hidden xl:flex items-center gap-7 ml-auto">
            {textLinks.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="nav-link group relative py-2"
              >
                <span className={`text-sm font-medium transition-colors duration-200 ${
                  showJa ? "" : "tracking-widest"
                } ${
                  isActive(item.href) ? "text-accent-strong" : "text-ink-soft group-hover:text-accent-strong"
                }`}>
                  {showJa ? t.nav[item.key] : item.label}
                </span>
                <span
                  aria-hidden
                  className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left rounded-full bg-accent transition-transform duration-300 ${
                    isActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 xl:ml-7">
            <PreferenceControls className="hidden min-[520px]:flex" />

            <div className="hidden xl:block">
              <SiteButton href="/contact" className="px-5 py-2.5">
                {t.header.contact}
              </SiteButton>
            </div>

            <button
              className="flex flex-col gap-1.5 p-2 xl:hidden"
              onClick={() => setMenuOpenOn(menuOpen ? null : pathname)}
              aria-label={t.header.menu}
              aria-expanded={menuOpen}
            >
              <span className={`block w-5 h-0.5 bg-sumi transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-sumi transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-sumi transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 overflow-y-auto bg-washi px-6 pt-20 pb-8 xl:hidden"
          >
            {textLinks.map((item, i) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={item.href} onClick={() => setMenuOpenOn(null)} className="group flex flex-col items-center gap-1">
                  <span className={`text-xl font-medium transition-colors sm:text-2xl ${
                    showJa ? "tracking-wide" : "tracking-[0.18em] sm:tracking-widest"
                  } ${
                    isActive(item.href) ? "text-accent-strong" : "text-sumi group-hover:text-accent-strong"
                  }`}>
                    {showJa ? t.nav[item.key] : item.label}
                  </span>
                </Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <SiteButton href="/contact" className="mt-2 px-8" onClick={() => setMenuOpenOn(null)}>
                {t.header.contact}
              </SiteButton>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="min-[520px]:hidden"
            >
              <PreferenceControls />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
