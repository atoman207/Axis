"use client";

import { motion, useInView } from "framer-motion";
import { useMemo, useRef, type CSSProperties } from "react";
import { useI18n } from "@/components/PreferencesProvider";
import SectionEyebrow from "@/components/SectionEyebrow";

function devicon(path: string) {
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${path}`;
}

function simpleIcon(slug: string, hex: string) {
  return `https://cdn.simpleicons.org/${slug}/${hex}`;
}

function lucide(name: string) {
  return `https://cdn.jsdelivr.net/npm/lucide-static@0.469.0/icons/${name}.svg`;
}

/** OpenAI's mark ships colorless from third-party CDNs, so it's inlined here. */
function OpenAIMark({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="#74AA9C" style={{ display: "block" }}>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

type TechItem = {
  name: string;
  src?: string;
  isOpenAI?: boolean;
  wide?: boolean;
};

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
    dx: [0, 18 + (index % 5) * 6, -(12 + (index % 4) * 5), 8, 0],
    dy: [0, -(14 + (index % 6) * 5), 10 + (index % 3) * 6, -(6 + (index % 4) * 3), 0],
  };
}

const devFlow = [
  { key: "requirement",  step: "01", title: "Requirement",  icon: lucide("clipboard-list") },
  { key: "architecture", step: "02", title: "Architecture", icon: lucide("network") },
  { key: "design",       step: "03", title: "Design",       icon: lucide("palette") },
  { key: "development",  step: "04", title: "Development",  icon: lucide("code-xml") },
  { key: "testing",      step: "05", title: "Testing",      icon: lucide("shield-check") },
  { key: "deployment",   step: "06", title: "Deployment",   icon: lucide("rocket") },
  { key: "maintenance",  step: "07", title: "Maintenance",  icon: lucide("wrench") },
] as const;

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

function FloatingTechField({ items, active }: { items: TechItem[]; active: boolean }) {
  const seeds = useMemo(
    () => items.map((_, index) => driftSeed(index, items.length)),
    [items]
  );

  return (
    <div className="relative mb-24 h-[380px] overflow-hidden sm:h-[440px] md:h-[520px]">

      {items.map((tech, index) => {
        const seed = seeds[index];
        return (
          <motion.div
            key={tech.name}
            className="absolute will-change-transform"
            style={{ left: `${seed.left}%`, top: `${seed.top}%` }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={
              active
                ? {
                    opacity: 1,
                    scale: 1,
                    x: seed.dx,
                    y: seed.dy,
                  }
                : { opacity: 0, scale: 0.85 }
            }
            transition={{
              opacity: { duration: 0.5, delay: index * 0.02 },
              scale: { duration: 0.5, delay: index * 0.02 },
              x: {
                duration: seed.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: seed.delay,
              },
              y: {
                duration: seed.duration * 1.08,
                repeat: Infinity,
                ease: "easeInOut",
                delay: seed.delay * 0.9,
              },
            }}
          >
            <TechIcon tech={tech} />
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Technology() {
  const ref     = useRef(null);
  const inView  = useInView(ref, { once: true, margin: "-60px" });
  const flowRef = useRef(null);
  const flowIn  = useInView(flowRef, { once: true, margin: "-60px" });
  const { t }   = useI18n();

  return (
    <section id="technology" className="section-padding relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-shu-100/40 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div ref={ref} className="mb-12 text-center md:mb-14">
          <SectionEyebrow align="center">Technology</SectionEyebrow>
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 text-3xl font-bold text-sumi md:text-5xl"
          >
            {t.technology.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted"
          >
            {t.technology.lead}
          </motion.p>
        </div>

        <FloatingTechField items={techStack} active={inView} />

        <div ref={flowRef}>
          <SectionEyebrow align="center">Development Flow</SectionEyebrow>
          <motion.h3
            initial={{ opacity: 0, y: 18 }}
            animate={flowIn ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12 text-center text-2xl font-bold text-sumi md:text-3xl"
          >
            {t.technology.flowTitle}
          </motion.h3>

          <div className="relative">
            <div className="absolute top-8 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-gold-300 to-transparent lg:block" />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7 lg:gap-2">
              {devFlow.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 28 }}
                  animate={flowIn ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                  className="relative flex items-start gap-4 lg:flex-col lg:items-center lg:gap-3"
                >
                  {i < devFlow.length - 1 && (
                    <div className="absolute top-12 left-5 h-full w-px bg-gradient-to-b from-gold-300 to-transparent lg:hidden" />
                  )}
                  <div className="relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-shu-200 bg-popover transition-all hover:border-shu-400 hover:shadow-md">
                    <span
                      aria-hidden="true"
                      className="icon-mask h-5 w-5 opacity-80"
                      style={{ "--icon": `url(${step.icon})` } as CSSProperties}
                    />
                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-gold-300 bg-popover shadow-sm">
                      <span className="text-[8px] leading-none font-bold text-accent">{i + 1}</span>
                    </div>
                  </div>
                  <div className="lg:text-center">
                    <div className="mb-0.5 font-mono text-xs text-accent">{step.step}</div>
                    <div className="text-sm font-semibold text-sumi">{step.title}</div>
                    <div className="mt-0.5 text-xs leading-tight text-faint">{t.technology.flow[step.key]}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
