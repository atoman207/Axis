"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/components/PreferencesProvider";

const quickReplies = [
  { key: "service", href: "/service" },
  { key: "works", href: "/works" },
  { key: "contact", href: "/contact" },
] as const;

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={panelRef} className="fixed bottom-4 left-4 z-50 sm:bottom-6 sm:left-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="mb-3 w-[min(90vw,320px)] overflow-hidden rounded-2xl border border-line bg-popover shadow-2xl sm:mb-4 sm:w-[min(92vw,340px)]"
          >
            <div className="bg-gradient-to-r from-shu-700 to-gold-600 px-4 py-3.5 text-white sm:px-5 sm:py-4">
              <p className="text-sm font-semibold">{t.chatbot.title}</p>
              <p className="mt-1 text-xs text-white/85">
                {t.chatbot.subtitle}
              </p>
            </div>

            <div className="space-y-3 px-4 py-3.5 sm:px-5 sm:py-4">
              <div className="rounded-2xl rounded-tl-sm bg-sunken px-3.5 py-2.5 text-sm leading-relaxed text-ink-soft sm:px-4 sm:py-3">
                {t.chatbot.greeting[0]}
                <br />
                {t.chatbot.greeting[1]}
              </div>

              <div className="flex flex-wrap gap-2">
                {quickReplies.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-shu-200 bg-shu-50 px-3 py-1.5 text-xs font-medium text-accent-strong transition hover:bg-shu-100"
                  >
                    {t.chatbot.quick[item.key]}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-line-soft px-4 py-3">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-shu-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-shu-700"
              >
                {t.chatbot.cta}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? t.chatbot.close : t.chatbot.open}
        aria-expanded={open}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-shu-600 text-white shadow-lg shadow-shu-600/30 transition hover:bg-shu-700 hover:shadow-xl sm:h-14 sm:w-14"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M8 10h.01M12 10h.01M16 10h.01M7.5 17l-4.5 1.5 1.5-3.5A7.5 7.5 0 1112 19.5" />
          </svg>
        )}
      </button>
    </div>
  );
}
