"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/components/PreferencesProvider";

function devicon(path: string) {
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${path}`;
}

function simpleIcon(slug: string, hex?: string) {
  return `https://cdn.simpleicons.org/${slug}${hex ? `/${hex}` : ""}`;
}

/** OpenAI's mark ships colorless from third-party CDNs, so it's inlined here. */
function OpenAIMark({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="#74AA9C" style={{ display: "block" }}>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

type Skill = { name: string; src?: string; isOpenAI?: boolean };

type PositionId = "frontend" | "backend" | "ai" | "cloud" | "design";

/** Everything about a position that doesn't change with the language. */
type PositionStyle = {
  id: PositionId;
  role: string;
  type: "both" | "contract";
  bg: string;
  skills: Skill[];
  badgeText: string;
  dot: string;
  border: string;
  glow: string;
};

/** A position with its employment type and description in the current language. */
type Position = Omit<PositionStyle, "type"> & { type: string; desc: string };

const positions: PositionStyle[] = [
  {
    id: "frontend",
    role: "Frontend Engineer",
    type: "both",
    bg: "/career/frontend-bg.jpg",
    skills: [
      { name: "React", src: devicon("react/react-original.svg") },
      { name: "Next.js", src: simpleIcon("nextdotjs", "FFFFFF") },
      { name: "TypeScript", src: devicon("typescript/typescript-original.svg") },
      { name: "Tailwind CSS", src: devicon("tailwindcss/tailwindcss-original.svg") },
      { name: "JavaScript", src: devicon("javascript/javascript-original.svg") },
      { name: "Vite", src: devicon("vitejs/vitejs-original.svg") },
    ],
    badgeText: "text-shu-300",
    dot: "bg-shu-400",
    border: "border-shu-400/50",
    glow: "rgba(86, 145, 251, 0.55)",
  },
  {
    id: "backend",
    role: "Backend Engineer",
    type: "both",
    bg: "/career/backend-bg.jpg",
    skills: [
      { name: "Python", src: devicon("python/python-original.svg") },
      { name: "FastAPI", src: devicon("fastapi/fastapi-original.svg") },
      { name: "Node.js", src: devicon("nodejs/nodejs-original.svg") },
      { name: "PostgreSQL", src: devicon("postgresql/postgresql-original.svg") },
      { name: "Redis", src: devicon("redis/redis-original.svg") },
      { name: "Docker", src: devicon("docker/docker-original.svg") },
    ],
    badgeText: "text-sky-300",
    dot: "bg-sky-400",
    border: "border-sky-400/50",
    glow: "rgba(56, 189, 248, 0.55)",
  },
  {
    id: "ai",
    role: "AI Engineer",
    type: "both",
    bg: "/career/ai-bg.jpg",
    skills: [
      { name: "OpenAI", isOpenAI: true },
      { name: "Python", src: devicon("python/python-original.svg") },
      { name: "LangChain", src: simpleIcon("langchain") },
      { name: "Claude", src: simpleIcon("anthropic", "D4A27F") },
      { name: "Gemini", src: simpleIcon("googlegemini", "8E75F0") },
      { name: "Hugging Face", src: simpleIcon("huggingface", "FFD21E") },
    ],
    badgeText: "text-gold-300",
    dot: "bg-gold-400",
    border: "border-gold-400/50",
    glow: "rgba(125, 211, 252, 0.55)",
  },
  {
    id: "cloud",
    role: "Cloud Engineer",
    type: "both",
    bg: "/career/cloud-bg.jpg",
    skills: [
      { name: "AWS", src: devicon("amazonwebservices/amazonwebservices-original-wordmark.svg") },
      { name: "Azure", src: devicon("azure/azure-original.svg") },
      { name: "Terraform", src: devicon("terraform/terraform-original.svg") },
      { name: "Kubernetes", src: devicon("kubernetes/kubernetes-plain.svg") },
      { name: "Docker", src: devicon("docker/docker-original.svg") },
      { name: "GitHub Actions", src: simpleIcon("githubactions", "2088FF") },
    ],
    badgeText: "text-ai-300",
    dot: "bg-ai-400",
    border: "border-ai-400/50",
    glow: "rgba(142, 163, 204, 0.55)",
  },
  {
    id: "design",
    role: "UI/UX Designer",
    type: "contract",
    bg: "/career/design-bg.jpg",
    skills: [
      { name: "Figma", src: devicon("figma/figma-original.svg") },
      { name: "Adobe XD", src: devicon("xd/xd-plain.svg") },
      { name: "Illustrator", src: devicon("illustrator/illustrator-plain.svg") },
      { name: "Photoshop", src: devicon("photoshop/photoshop-plain.svg") },
      { name: "Sketch", src: devicon("sketch/sketch-original.svg") },
    ],
    badgeText: "text-pink-300",
    dot: "bg-pink-400",
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

function SkillChips({ skills, compact = false }: { skills: Skill[]; compact?: boolean }) {
  return (
    <div className={`flex flex-wrap ${compact ? "gap-1.5" : "gap-2"}`}>
      {skills.map((sk) => (
        <span
          key={sk.name}
          title={sk.name}
          className={`flex items-center justify-center rounded-lg bg-white/90 shadow-sm ${
            compact ? "h-8 w-8" : "h-9 w-9"
          }`}
        >
          {sk.isOpenAI ? (
            <OpenAIMark size={compact ? 15 : 18} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sk.src}
              alt={sk.name}
              className={compact ? "h-4 w-4 object-contain" : "h-5 w-5 object-contain"}
              draggable={false}
            />
          )}
        </span>
      ))}
    </div>
  );
}

function CareerCardFace({
  pos,
  expanded = false,
}: {
  pos: Position;
  expanded?: boolean;
}) {
  return (
    <>
      <div className="absolute inset-0">
        <Image
          src={pos.bg}
          alt=""
          fill
          className="object-cover"
          sizes={expanded ? "(min-width: 768px) 420px, 90vw" : "(min-width: 768px) 240px, 170px"}
          priority={expanded}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ai-950/80 via-ai-950/72 to-ai-950/92" />
      </div>

      <div className={`relative z-10 flex h-full flex-col ${expanded ? "p-7 md:p-8" : "p-4 md:p-5"}`}>
        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm ${pos.badgeText} ${
            expanded ? "mb-5 px-3 py-1 text-xs" : "mb-3 px-2.5 py-0.5 text-[10px]"
          }`}
        >
          <span className={`rounded-full ${pos.dot} ${expanded ? "h-1.5 w-1.5" : "h-1 w-1"}`} />
          {pos.type}
        </div>

        <h3 className={`font-bold text-white ${expanded ? "mb-3 text-2xl md:text-3xl" : "mb-2 text-sm md:text-base"}`}>
          {pos.role}
        </h3>
        <p
          className={`leading-relaxed text-white/75 ${
            expanded ? "mb-6 text-sm md:text-base" : "mb-auto line-clamp-4 text-[11px] md:text-xs"
          }`}
        >
          {pos.desc}
        </p>

        <div className={expanded ? "mt-auto" : "mt-3"}>
          <SkillChips skills={pos.skills} compact={!expanded} />
        </div>
      </div>
    </>
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
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useI18n();

  const localized: Position[] = positions.map((p) => ({
    ...p,
    type: t.career.types[p.type],
    desc: t.career.positions[p.id],
  }));
  const selected = localized.find((p) => p.role === selectedRole) ?? null;
  const fan = isMobile ? MOBILE_FAN : FAN;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="mb-4 text-xs uppercase tracking-[0.3em] text-accent"
          >
            Career
          </motion.p>
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
        <div className="relative mx-auto mb-10 flex h-[360px] w-full max-w-4xl items-end justify-center sm:h-[400px] md:mb-14 md:h-[460px]">
          {localized.map((pos, i) => {
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
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-shu-700 px-8 py-4 text-sm font-semibold text-white shadow-md transition-colors hover:bg-shu-800"
          >
            {t.career.apply}
            <span aria-hidden>→</span>
          </Link>
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

              <motion.button
                type="button"
                onClick={closeModal}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ delay: 0.12 }}
                className="rounded-full border border-white/20 bg-white/10 px-8 py-3 text-sm font-semibold tracking-wide text-white backdrop-blur-md transition hover:bg-white/20"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
