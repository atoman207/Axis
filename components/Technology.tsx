"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type CSSProperties } from "react";
import { useI18n } from "@/components/PreferencesProvider";

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
  { name: "Python", src: devicon("python/python-original.svg") },
  { name: "FastAPI", src: devicon("fastapi/fastapi-original.svg") },
  { name: "Node.js", src: devicon("nodejs/nodejs-original.svg") },
  { name: "Laravel", src: devicon("laravel/laravel-original.svg") },
  { name: "Java", src: devicon("java/java-original.svg") },
  { name: "AWS", src: devicon("amazonwebservices/amazonwebservices-original-wordmark.svg"), wide: true },
  { name: "Azure", src: devicon("azure/azure-original.svg") },
  { name: "Docker", src: devicon("docker/docker-original.svg") },
  { name: "PostgreSQL", src: devicon("postgresql/postgresql-original.svg") },
  { name: "MongoDB", src: devicon("mongodb/mongodb-original.svg") },
  { name: "Redis", src: devicon("redis/redis-original.svg") },
  { name: "OpenAI", isOpenAI: true },
  { name: "Claude", src: simpleIcon("anthropic", "D4A27F") },
  { name: "Gemini", src: simpleIcon("googlegemini", "8E75F0") },
  { name: "GitHub", src: simpleIcon("github", "181717") },
  { name: "Terraform", src: devicon("terraform/terraform-original.svg") },
  { name: "Kubernetes", src: devicon("kubernetes/kubernetes-plain.svg") },
];

const devFlow = [
  { key: "requirement",  step: "01", title: "Requirement",  icon: lucide("clipboard-list") },
  { key: "architecture", step: "02", title: "Architecture", icon: lucide("network") },
  { key: "design",       step: "03", title: "Design",       icon: lucide("palette") },
  { key: "development",  step: "04", title: "Development",  icon: lucide("code-xml") },
  { key: "testing",      step: "05", title: "Testing",      icon: lucide("shield-check") },
  { key: "deployment",   step: "06", title: "Deployment",   icon: lucide("rocket") },
  { key: "maintenance",  step: "07", title: "Maintenance",  icon: lucide("wrench") },
] as const;

export default function Technology() {
  const ref     = useRef(null);
  const inView  = useInView(ref, { once: true, margin: "-60px" });
  const flowRef = useRef(null);
  const flowIn  = useInView(flowRef, { once: true, margin: "-60px" });
  const { t }   = useI18n();

  return (
    <section id="technology" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-60" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-shu-100/40 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={ref} className="mb-16 text-center">
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} className="text-xs tracking-[0.3em] text-accent mb-4 uppercase">Technology</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }} className="text-3xl md:text-5xl font-bold text-sumi mb-4">
            {t.technology.title}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="text-muted text-sm">
            {t.technology.lead}
          </motion.p>
        </div>

        {/* Tech grid */}
        <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-10 gap-3 mb-24">
          {techStack.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.025 }}
              className="bg-surface rounded-xl p-3 flex flex-col items-center gap-2 group hover:scale-110 transition-all duration-200 cursor-default border border-line-soft hover:border-shu-200 hover:shadow-md"
            >
              {/* brand marks are drawn for light backgrounds, so in space they sit on a pale chip */}
              <span className="flex h-8 w-8 items-center justify-center space:h-9 space:w-9 space:rounded-lg space:bg-white/90">
                {tech.isOpenAI ? (
                  <OpenAIMark size={28} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tech.src}
                    alt={tech.name}
                    className={tech.wide ? "h-6 w-10 object-contain space:w-8" : "h-7 w-7 object-contain"}
                    draggable={false}
                  />
                )}
              </span>
              <span className="text-[10px] text-faint text-center leading-tight group-hover:text-ink-soft transition-colors">{tech.name}</span>
            </motion.div>
          ))}
        </div>

        {/* Development Flow */}
        <div ref={flowRef}>
          <motion.p initial={{ opacity: 0 }} animate={flowIn ? { opacity: 1 } : {}} className="text-xs tracking-[0.3em] text-accent mb-4 uppercase text-center">Development Flow</motion.p>
          <motion.h3 initial={{ opacity: 0, y: 18 }} animate={flowIn ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }} className="text-2xl md:text-3xl font-bold text-sumi text-center mb-12">
            {t.technology.flowTitle}
          </motion.h3>

          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-300 to-transparent" />

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-2">
              {devFlow.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 28 }}
                  animate={flowIn ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                  className="relative flex lg:flex-col items-start lg:items-center gap-4 lg:gap-3"
                >
                  {i < devFlow.length - 1 && (
                    <div className="lg:hidden absolute left-5 top-12 w-px h-full bg-gradient-to-b from-gold-300 to-transparent" />
                  )}
                  <div className="relative z-10 w-11 h-11 rounded-full bg-popover border border-shu-200 flex items-center justify-center flex-shrink-0 hover:border-shu-400 hover:shadow-md transition-all">
                    <span
                      aria-hidden="true"
                      className="icon-mask h-5 w-5 opacity-80"
                      style={{ "--icon": `url(${step.icon})` } as CSSProperties}
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-popover border border-gold-300 flex items-center justify-center shadow-sm">
                      <span className="text-[8px] text-accent font-bold leading-none">{i + 1}</span>
                    </div>
                  </div>
                  <div className="lg:text-center">
                    <div className="text-xs text-accent font-mono mb-0.5">{step.step}</div>
                    <div className="text-sumi text-sm font-semibold">{step.title}</div>
                    <div className="text-faint text-xs mt-0.5 leading-tight">{t.technology.flow[step.key]}</div>
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
