"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useI18n } from "@/components/PreferencesProvider";

const ModalScene = dynamic(() => import("./ModalScene"), { ssr: false });

export type ServiceDetail = {
  title: string;
  /** Japanese name shown above the English title; empty in English. */
  subtitle: string;
  overview: string;
  steps: string[];
  features: string[];
  threeColor: string;
  accent: string;   // Tailwind text class e.g. "text-accent"
  border: string;   // Tailwind border class
};

interface Props {
  service: ServiceDetail | null;
  onClose: () => void;
}

export default function ServiceModal({ service, onClose }: Props) {
  const { t } = useI18n();
  const labels = t.services.modal;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (service) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [service]);

  return (
    <AnimatePresence>
      {service && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-ai-900/80 backdrop-blur-xl" />

          {/* Three.js canvas */}
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            <ModalScene color={service.threeColor} />
          </div>

          {/* Modal card */}
          <motion.div
            key="modal-card"
            initial={{ scale: 0.88, y: 24, opacity: 0 }}
            animate={{ scale: 1,    y: 0,  opacity: 1 }}
            exit={{    scale: 0.88, y: 24, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl bg-popover border border-line shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-sunken border border-line flex items-center justify-center text-faint hover:text-sumi hover:bg-line transition-all z-10"
              aria-label={labels.close}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-8 md:p-10">
              {/* Header */}
              <div className="mb-8">
                <span className={`text-xs tracking-[0.3em] uppercase font-medium ${service.accent} mb-2 block`}>
                  {service.subtitle || "Service"}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-sumi">{service.title}</h2>
              </div>

              {/* Overview */}
              <div className={`rounded-2xl p-6 mb-8 bg-shu-50 border ${service.border}`}>
                <p className="text-ink-soft text-sm md:text-base leading-relaxed">{service.overview}</p>
              </div>

              {/* Process */}
              <div className="mb-8">
                <h3 className="text-xs tracking-widest text-faint uppercase mb-4">{labels.process}</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-shu-400/50 via-gold-300/30 to-transparent" />
                  <div className="space-y-4 pl-10">
                    {service.steps.map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.07 }}
                        className="flex items-center gap-3"
                      >
                        <div className="absolute left-[11px] w-3.5 h-3.5 rounded-full bg-shu-100 border border-shu-300 flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-shu-500" />
                        </div>
                        <span className="text-sm text-ink-soft">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-xs tracking-widest text-faint uppercase mb-4">{labels.scope}</h3>
                <div className="flex flex-wrap gap-2">
                  {service.features.map((f, i) => (
                    <motion.span
                      key={f}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 + i * 0.04 }}
                      className={`text-xs px-3 py-1.5 rounded-full bg-shu-50 border ${service.border} ${service.accent}`}
                    >
                      {f}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 pt-6 border-t border-line-soft">
                <a
                  href="/contact"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white bg-shu-600 hover:bg-shu-700 transition-colors shadow-sm"
                >
                  {labels.cta}
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
