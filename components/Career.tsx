"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useI18n } from "@/components/PreferencesProvider";
import SectionEyebrow from "@/components/SectionEyebrow";
import SiteButton from "@/components/SiteButton";

type PositionId = "frontend" | "backend" | "ai" | "cloud" | "design";

type Position = {
  id: PositionId;
  role: string;
  bg: string;
  border: string;
  glow: string;
};

const positions: Position[] = [
  {
    id: "frontend",
    role: "Frontend Engineer",
    bg: "/skillcard/skillcard-4.png",
    border: "border-shu-400/50",
    glow: "rgba(86, 145, 251, 0.55)",
  },
  {
    id: "backend",
    role: "Backend Engineer",
    bg: "/skillcard/skillcard-5.png",
    border: "border-sky-400/50",
    glow: "rgba(56, 189, 248, 0.55)",
  },
  {
    id: "ai",
    role: "AI Engineer",
    bg: "/skillcard/skillcard-3.png",
    border: "border-gold-400/50",
    glow: "rgba(125, 211, 252, 0.55)",
  },
  {
    id: "cloud",
    role: "Cloud Engineer",
    bg: "/skillcard/skillcard-2.png",
    border: "border-ai-400/50",
    glow: "rgba(142, 163, 204, 0.55)",
  },
  {
    id: "design",
    role: "UI/UX Designer",
    bg: "/skillcard/skillcard-1.png",
    border: "border-pink-400/50",
    glow: "rgba(244, 114, 182, 0.55)",
  },
];

/** Fan geometry for a 5-card hand (index 0..4). */
const FAN = [
  { rotate: -28, x: -168, y: 54, z: 1 },
  { rotate: -14, x: -86,  y: 18, z: 2 },
  { rotate: 0,   x: 0,    y: 0,  z: 3 },
  { rotate: 14,  x: 86,   y: 18, z: 2 },
  { rotate: 28,  x: 168,  y: 54, z: 1 },
] as const;

const MOBILE_FAN = [
  { rotate: -18, x: -72, y: 36, z: 1 },
  { rotate: -9,  x: -36, y: 14, z: 2 },
  { rotate: 0,   x: 0,   y: 0,  z: 3 },
  { rotate: 9,   x: 36,  y: 14, z: 2 },
  { rotate: 18,  x: 72,  y: 36, z: 1 },
] as const;

function CareerCardFace({
  pos,
  expanded = false,
}: {
  pos: Position;
  expanded?: boolean;
}) {
  return (
    <div className="absolute inset-0">
      <Image
        src={pos.bg}
        alt={pos.role}
        fill
        className="object-cover object-top"
        sizes={expanded ? "(min-width: 768px) 420px, 90vw" : "(min-width: 768px) 240px, 170px"}
        priority={expanded}
      />
    </div>
  );
}

function RadiatingLight({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {/* Soft bloom */}
      <motion.div
        className="absolute h-[70vmin] w-[70vmin] rounded-full"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 62%)`,
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0.35, 0.7, 0.45], scale: [0.85, 1.08, 0.95] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Spinning ray burst */}
      <motion.div
        className="absolute h-[95vmin] w-[95vmin]"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, ${color} 8deg, transparent 16deg, transparent 36deg, ${color} 44deg, transparent 52deg, transparent 72deg, ${color} 80deg, transparent 88deg, transparent 108deg, ${color} 116deg, transparent 124deg, transparent 144deg, ${color} 152deg, transparent 160deg, transparent 180deg, ${color} 188deg, transparent 196deg, transparent 216deg, ${color} 224deg, transparent 232deg, transparent 252deg, ${color} 260deg, transparent 268deg, transparent 288deg, ${color} 296deg, transparent 304deg, transparent 324deg, ${color} 332deg, transparent 340deg, transparent 360deg)`,
          maskImage: "radial-gradient(circle, black 8%, transparent 68%)",
          WebkitMaskImage: "radial-gradient(circle, black 8%, transparent 68%)",
          opacity: 0.55,
        }}
        initial={{ opacity: 0, rotate: -20, scale: 0.7 }}
        animate={{ opacity: 0.55, rotate: 360, scale: 1 }}
        transition={{
          opacity: { duration: 0.45 },
          scale: { duration: 0.55 },
          rotate: { duration: 18, repeat: Infinity, ease: "linear" },
        }}
      />

      {/* Expanding shockwave rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: "28vmin",
            height: "28vmin",
            borderColor: color,
            boxShadow: `0 0 24px ${color}`,
          }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.55, 0], scale: [0.5, 2.4, 2.8] }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: i * 0.55,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export default function Career() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // Mobile-first default avoids desktop fan offsets overflowing small screens before hydration.
  const [isMobile, setIsMobile] = useState(true);
  const { t } = useI18n();

  const selected = positions.find((p) => p.role === selectedRole) ?? null;
  const fan = isMobile ? MOBILE_FAN : FAN;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!selectedRole) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedRole(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selectedRole]);

  const closeModal = () => setSelectedRole(null);

  return (
    <section id="career" className="section-padding relative scroll-mt-20 overflow-hidden">
      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center md:mb-14">
          <SectionEyebrow align="center">Career</SectionEyebrow>
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 text-3xl font-bold md:text-5xl"
          >
            Join Us.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted md:text-base"
          >
            {t.career.lead}
            <span className="mt-1 block text-xs text-faint md:text-sm">
              {t.career.hint}
            </span>
          </motion.p>
        </div>

        {/* Fan / hand of cards */}
        <div className="relative mx-auto mb-10 flex h-[360px] w-full max-w-4xl items-end justify-center overflow-x-clip sm:h-[400px] md:mb-14 md:h-[460px]">
          {positions.map((pos, i) => {
            const slot = fan[i];
            const isSelected = selectedRole === pos.role;
            if (isSelected) return null;

            const isNeighborHover =
              hoveredIndex !== null && Math.abs(hoveredIndex - i) === 1 && !selectedRole;
            const lift = hoveredIndex === i && !selectedRole;

            return (
              <motion.button
                key={pos.role}
                type="button"
                layoutId={`career-card-${pos.role}`}
                initial={{ opacity: 0, y: 80, rotate: slot.rotate * 1.4 }}
                animate={
                  inView
                    ? {
                        opacity: 1,
                        x: slot.x,
                        y: slot.y + (lift ? -28 : 0),
                        rotate: slot.rotate + (lift ? (slot.rotate > 0 ? 2 : slot.rotate < 0 ? -2 : 0) : 0),
                        scale: lift ? 1.06 : isNeighborHover ? 0.97 : 1,
                        zIndex: lift ? 20 : slot.z,
                      }
                    : {}
                }
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 24,
                  delay: 0.12 + i * 0.05,
                }}
                onHoverStart={() => setHoveredIndex(i)}
                onHoverEnd={() => setHoveredIndex(null)}
                onClick={() => setSelectedRole(pos.role)}
                aria-label={t.career.viewDetails(pos.role)}
                className={`absolute bottom-8 origin-bottom overflow-hidden rounded-2xl border ${pos.border} bg-ai-950 text-left shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-shu-400 ${
                  isMobile ? "h-[250px] w-[160px]" : "h-[300px] w-[220px] md:h-[320px] md:w-[240px]"
                }`}
                style={{
                  boxShadow: lift
                    ? `0 24px 48px rgba(0,0,0,0.28), 0 0 0 1px ${pos.glow}`
                    : "0 16px 36px rgba(0,0,0,0.22)",
                }}
              >
                <CareerCardFace pos={pos} />
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <SiteButton href="/contact" className="px-8 py-4">
            {t.career.apply}
          </SiteButton>
        </motion.div>
      </div>

      {/* Drawn card modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="career-modal"
            className="fixed inset-0 z-[220] flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.button
              type="button"
              aria-label={t.career.closeBackdrop}
              className="absolute inset-0 bg-ai-950/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />

            <RadiatingLight color={selected.glow} />

            <motion.div
              className="relative z-10 flex w-full max-w-[420px] flex-col items-center gap-5"
              initial={{ opacity: 0, y: 40, scale: 0.86, rotate: -6 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 28, scale: 0.9, rotate: 4 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
            >
              <motion.div
                layoutId={`career-card-${selected.role}`}
                className={`relative h-[460px] w-full overflow-hidden rounded-3xl border ${selected.border} bg-ai-950 shadow-2xl md:h-[500px]`}
                style={{
                  boxShadow: `0 30px 80px rgba(0,0,0,0.45), 0 0 60px ${selected.glow}`,
                }}
              >
                <CareerCardFace pos={selected} expanded />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ delay: 0.12 }}
              >
                <SiteButton type="button" onClick={closeModal} tone="onDark" className="px-8" hideArrow>
                  Close
                </SiteButton>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
