"use client";

import { motion, useInView } from "framer-motion";
import { useMemo, useRef, type CSSProperties } from "react";
import DevFlow from "@/components/DevFlow";
import MaskLines from "@/components/motion/MaskLines";
import OpenAIMark from "@/components/OpenAIMark";
import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionEyebrow from "@/components/SectionEyebrow";
import TechArchitecture from "@/components/TechArchitecture";
import { EASE_OUT } from "@/lib/motion";
import { devicon, simpleIcon, type TechItem } from "@/lib/tech-icons";

const techStack: TechItem[] = [
  { name: "React", src: devicon("react/react-original.svg") },
  { name: "Next.js", src: simpleIcon("nextdotjs", "000000") },
  { name: "TypeScript", src: devicon("typescript/typescript-original.svg") },
  { name: "JavaScript", src: devicon("javascript/javascript-original.svg") },
  { name: "Vue.js", src: devicon("vuejs/vuejs-original.svg") },
  { name: "Python", src: devicon("python/python-original.svg") },
  { name: "FastAPI", src: devicon("fastapi/fastapi-original.svg") },
  { name: "Node.js", src: devicon("nodejs/nodejs-original.svg") },
  { name: "Laravel", src: devicon("laravel/laravel-original.svg") },
  { name: "PHP", src: devicon("php/php-original.svg") },
  { name: "Java", src: devicon("java/java-original.svg") },
  { name: "Go", src: devicon("go/go-original-wordmark.svg"), wide: true },
  { name: "AWS", src: devicon("amazonwebservices/amazonwebservices-original-wordmark.svg"), wide: true },
  { name: "Azure", src: devicon("azure/azure-original.svg") },
  { name: "GCP", src: devicon("googlecloud/googlecloud-original.svg") },
  { name: "Docker", src: devicon("docker/docker-original.svg") },
  { name: "Kubernetes", src: devicon("kubernetes/kubernetes-plain.svg") },
  { name: "Terraform", src: devicon("terraform/terraform-original.svg") },
  { name: "PostgreSQL", src: devicon("postgresql/postgresql-original.svg") },
  { name: "MySQL", src: devicon("mysql/mysql-original.svg") },
  { name: "MongoDB", src: devicon("mongodb/mongodb-original.svg") },
  { name: "Redis", src: devicon("redis/redis-original.svg") },
  { name: "Elasticsearch", src: simpleIcon("elasticsearch", "005571") },
  { name: "GraphQL", src: devicon("graphql/graphql-plain.svg") },
  { name: "Prisma", src: simpleIcon("prisma", "2D3748") },
  { name: "Supabase", src: simpleIcon("supabase", "3FCF8E") },
  { name: "Tailwind", src: devicon("tailwindcss/tailwindcss-original.svg") },
  { name: "Three.js", src: simpleIcon("threedotjs", "000000") },
  { name: "Flutter", src: devicon("flutter/flutter-original.svg") },
  { name: "Swift", src: devicon("swift/swift-original.svg") },
  { name: "OpenAI", isOpenAI: true },
  { name: "Claude", src: simpleIcon("anthropic", "D4A27F") },
  { name: "Gemini", src: simpleIcon("googlegemini", "8E75F0") },
  { name: "LangChain", src: simpleIcon("langchain", "1C3C3C") },
  { name: "GitHub", src: simpleIcon("github", "181717") },
  { name: "Vercel", src: simpleIcon("vercel", "000000") },
  { name: "Figma", src: devicon("figma/figma-original.svg") },
  { name: "Nginx", src: devicon("nginx/nginx-original.svg") },
];

type DriftSeed = {
  left: number;
  top: number;
  duration: number;
  delay: number;
  dx: number[];
  dy: number[];
};

/** Deterministic layout/motion so SSR and client stay in sync. */
function driftSeed(index: number, total: number): DriftSeed {
  const cols = 8;
  const rows = Math.ceil(total / cols);
  const col = index % cols;
  const row = Math.floor(index / cols);
  const jitterX = ((index * 17) % 11) - 5;
  const jitterY = ((index * 29) % 9) - 4;

  return {
    left: Math.min(88, Math.max(2, (col / (cols - 1)) * 82 + 4 + jitterX)),
    top: Math.min(78, Math.max(4, (row / Math.max(rows - 1, 1)) * 68 + 6 + jitterY)),
    duration: 14 + (index % 8) * 1.7,
    delay: (index % 9) * 0.55,
    dx: [18 + (index % 5) * 6, -(12 + (index % 4) * 5), 8],
    dy: [-(14 + (index % 6) * 5), 10 + (index % 3) * 6, -(6 + (index % 4) * 3)],
  };
}

function TechIcon({ tech }: { tech: TechItem }) {
  return (
    <span
      title={tech.name}
      aria-label={tech.name}
      className="flex h-10 w-10 items-center justify-center drop-shadow-sm sm:h-11 sm:w-11"
    >
      {tech.isOpenAI ? (
        <OpenAIMark size={36} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={tech.src}
          alt={tech.name}
          className={
            tech.wide
              ? "h-7 w-12 object-contain sm:h-8 sm:w-14"
              : "h-8 w-8 object-contain sm:h-9 sm:w-9"
          }
          draggable={false}
        />
      )}
    </span>
  );
}

/**
 * The stack as a slowly drifting constellation. The drift is pure CSS (compositor-only)
 * and pauses whenever the field is off-screen; hovering an icon names it.
 */
function FloatingTechField({ items }: { items: TechItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const entered = useInView(ref, { once: true, margin: "-60px" });
  const visible = useInView(ref, { margin: "120px" });
  const seeds = useMemo(
    () => items.map((_, index) => driftSeed(index, items.length)),
    [items]
  );

  return (
    <div
      ref={ref}
      className={`tech-field relative mb-24 h-[380px] overflow-hidden sm:h-[440px] md:h-[520px] ${visible ? "is-visible" : ""}`}
    >
      {/* soft light pooling behind the icons */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="aurora absolute left-[12%] top-[20%] h-64 w-64 rounded-full bg-shu-400/15 blur-[90px]" />
        <div className="aurora aurora--slow absolute right-[10%] bottom-[12%] h-72 w-72 rounded-full bg-violet-500/12 blur-[100px]" />
      </div>

      {items.map((tech, index) => {
        const seed = seeds[index];
        return (
          <motion.div
            key={tech.name}
            className="group absolute hover:z-10"
            style={{ left: `${seed.left}%`, top: `${seed.top}%` }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={entered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.7, delay: index * 0.025, ease: EASE_OUT }}
          >
            <div
              className="tech-drift"
              style={
                {
                  "--dx1": `${seed.dx[0]}px`,
                  "--dy1": `${seed.dy[0]}px`,
                  "--dx2": `${seed.dx[1]}px`,
                  "--dy2": `${seed.dy[1]}px`,
                  "--dx3": `${seed.dx[2]}px`,
                  "--dy3": `${seed.dy[2]}px`,
                  "--drift-dur": `${seed.duration}s`,
                  "--drift-delay": `${-seed.delay}s`,
                } as CSSProperties
              }
            >
              <div className="relative transition-transform duration-300 ease-out group-hover:scale-125">
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-sky-400/0 blur-xl transition-colors duration-300 group-hover:bg-sky-400/40"
                />
                <TechIcon tech={tech} />
              </div>
              <span className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 translate-y-1 rounded-full border border-line bg-popover px-2.5 py-1 text-[10px] font-semibold tracking-wide whitespace-nowrap text-sumi opacity-0 shadow-sm transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {tech.name}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Technology() {
  const { t } = useI18n();
  const copy = t.technology;

  return (
    <section id="technology" className="section-padding relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-shu-100/40 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center md:mb-14">
          <SectionEyebrow align="center">Technology</SectionEyebrow>
          <h2 className="mb-4 text-3xl font-bold text-sumi md:text-5xl">
            <MaskLines lines={[copy.title]} delay={0.1} />
          </h2>
          <Reveal delay={0.2} y={16}>
            <p className="text-sm text-muted">{copy.lead}</p>
          </Reveal>
        </div>

        <FloatingTechField items={techStack} />

        <div className="mb-24 md:mb-32">
          <div className="mb-10 text-center md:mb-12">
            <SectionEyebrow align="center">Architecture</SectionEyebrow>
            <h3 className="text-2xl font-bold text-sumi md:text-3xl">
              <MaskLines lines={[copy.architecture.title]} delay={0.08} />
            </h3>
            <Reveal delay={0.2} y={14}>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-loose text-muted">{copy.architecture.lead}</p>
            </Reveal>
          </div>
          <TechArchitecture />
        </div>

        <DevFlow />
      </div>
    </section>
  );
}
