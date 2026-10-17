"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, type CSSProperties } from "react";
import { useI18n } from "@/components/PreferencesProvider";
import SectionEyebrow from "@/components/SectionEyebrow";
import ServiceModal, { type ServiceDetail } from "./ServiceModal";
import OpenAIMark from "@/components/OpenAIMark";
import MaskLines from "@/components/motion/MaskLines";
import TiltCard from "@/components/motion/TiltCard";
import { EASE_OUT } from "@/lib/motion";
import { devicon, lucide, simpleIcon, type TechItem } from "@/lib/tech-icons";

type StackIcon = TechItem;

export type ServiceId = "ai" | "web" | "cloud" | "mobile" | "design" | "consulting";

/** Everything about a service that doesn't change with the language. */
type ServiceStyle = {
  id: ServiceId;
  title: string;
  stacks: StackIcon[];
  iconSrc: string;
  /** Card background — numbered assets are mapped in reverse (01 → 6, …, 06 → 1). */
  bgSrc: string;
  accent: string;
  border: string;
  threeColor: string;
  tagBg: string;
  tagBorder: string;
};

export const services: ServiceStyle[] = [
  {
    id: "ai",
    title: "AI Development",
    bgSrc: "/sites/bg/service-card-6.png",
    stacks: [
      { name: "OpenAI", isOpenAI: true },
      { name: "Claude", src: simpleIcon("anthropic", "D4A27F") },
      { name: "Gemini", src: simpleIcon("googlegemini", "8E75F0") },
      { name: "LangChain", src: simpleIcon("langchain") },
      { name: "Hugging Face", src: simpleIcon("huggingface", "FFD21E") },
      { name: "Python", src: devicon("python/python-original.svg") },
    ],
    iconSrc: lucide("sparkles"),
    accent: "text-accent",
    border: "border-shu-100",
    threeColor: "#2f6ff2",
    tagBg: "bg-shu-50", tagBorder: "border-shu-100",
  },
  {
    id: "web",
    title: "Web Development",
    bgSrc: "/sites/bg/service-card-5.png",
    stacks: [
      { name: "React", src: devicon("react/react-original.svg") },
      { name: "Next.js", src: simpleIcon("nextdotjs", "000000") },
      { name: "Vue", src: devicon("vuejs/vuejs-original.svg") },
      { name: "Nuxt", src: devicon("nuxtjs/nuxtjs-original.svg") },
      { name: "Laravel", src: devicon("laravel/laravel-original.svg") },
      { name: "Node.js", src: devicon("nodejs/nodejs-original.svg") },
    ],
    iconSrc: lucide("code-xml"),
    accent: "text-accent-alt",
    border: "border-gold-200",
    threeColor: "#0ea5e9",
    tagBg: "bg-gold-50", tagBorder: "border-gold-200",
  },
  {
    id: "cloud",
    title: "Cloud",
    bgSrc: "/sites/bg/service-card-4.png",
    stacks: [
      { name: "AWS", src: devicon("amazonwebservices/amazonwebservices-original-wordmark.svg"), wide: true },
      { name: "Azure", src: devicon("azure/azure-original.svg") },
      { name: "Docker", src: devicon("docker/docker-original.svg") },
      { name: "Terraform", src: devicon("terraform/terraform-original.svg") },
      { name: "Kubernetes", src: devicon("kubernetes/kubernetes-plain.svg") },
      { name: "GitHub Actions", src: simpleIcon("githubactions", "2088FF") },
    ],
    iconSrc: lucide("cloud"),
    accent: "text-accent",
    border: "border-ai-100",
    threeColor: "#5691fb",
    tagBg: "bg-ai-50", tagBorder: "border-ai-100",
  },
  {
    id: "mobile",
    title: "Mobile",
    bgSrc: "/sites/bg/service-card-3.png",
    stacks: [
      { name: "Flutter", src: devicon("flutter/flutter-original.svg") },
      { name: "React Native", src: devicon("react/react-original.svg") },
      { name: "Expo", src: simpleIcon("expo", "000020") },
      { name: "iOS", src: devicon("apple/apple-original.svg") },
      { name: "Android", src: devicon("android/android-original.svg") },
    ],
    iconSrc: lucide("smartphone"),
    accent: "text-accent",
    border: "border-shu-100",
    threeColor: "#38bdf8",
    tagBg: "bg-shu-50", tagBorder: "border-shu-100",
  },
  {
    id: "design",
    title: "UI/UX Design",
    bgSrc: "/sites/bg/service-card-2.png",
    stacks: [
      { name: "Figma", src: devicon("figma/figma-original.svg") },
      { name: "Storybook", src: simpleIcon("storybook", "FF4785") },
      { name: "Adobe XD", src: devicon("xd/xd-plain.svg") },
      { name: "Sketch", src: devicon("sketch/sketch-original.svg") },
      { name: "Illustrator", src: devicon("illustrator/illustrator-plain.svg") },
    ],
    iconSrc: lucide("palette"),
    accent: "text-accent",
    border: "border-ai-100",
    threeColor: "#8ab6ff",
    tagBg: "bg-ai-50", tagBorder: "border-ai-100",
  },
  {
    id: "consulting",
    title: "Consulting",
    bgSrc: "/sites/bg/service-card-1.png",
    stacks: [
      { name: "GitHub", src: simpleIcon("github", "181717") },
      { name: "Notion", src: simpleIcon("notion", "000000") },
      { name: "Jira", src: simpleIcon("jira", "0052CC") },
      { name: "Miro", src: simpleIcon("miro", "050038") },
      { name: "Slack", src: devicon("slack/slack-original.svg") },
    ],
    iconSrc: lucide("briefcase-business"),
    accent: "text-accent-alt",
    border: "border-gold-200",
    threeColor: "#7dd3fc",
    tagBg: "bg-gold-50", tagBorder: "border-gold-200",
  },
];

export default function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [selectedId, setSelectedId] = useState<ServiceId | null>(null);
  const { t } = useI18n();

  // Keyed by id (not a copy of the text) so an open modal follows a language switch.
  const selectedStyle = services.find((s) => s.id === selectedId);
  const selected: ServiceDetail | null = selectedStyle
    ? { ...selectedStyle, ...t.services.items[selectedStyle.id] }
    : null;

  return (
    <section id="service" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-shu-100/30 rounded-full blur-[100px]" />
      </div>

      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center">
          <SectionEyebrow align="center">Service</SectionEyebrow>
          <h2 className="text-3xl md:text-5xl font-bold text-sumi mb-3">
            <MaskLines lines={["What We Do"]} delay={0.1} />
          </h2>
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.35 }} className="text-faint text-sm">
            {t.services.hint}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => {
            const text = t.services.items[s.id];
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 48 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: EASE_OUT }}
                className="h-full"
              >
                <TiltCard
                  role="button"
                  tabIndex={0}
                  aria-haspopup="dialog"
                  aria-label={`${s.title} — ${t.services.more}`}
                  onClick={() => setSelectedId(s.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(s.id);
                    }
                  }}
                  className={`group h-full cursor-pointer border ${s.border} bg-surface transition-shadow duration-500 hover:shadow-[0_32px_64px_-32px_rgba(47,111,242,0.65),0_18px_40px_-26px_rgba(139,92,246,0.55)] focus-visible:outline-none`}
                >
                  {/* clipped backdrop — kept apart so the content above can lift in 3D */}
                  <div aria-hidden className="absolute inset-0 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                      style={{ backgroundImage: `url(${s.bgSrc})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060d1f]/92 via-[#060d1f]/72 to-[#060d1f]/35" />
                    {/* soft blue/violet light rising from below on hover */}
                    <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_125%,rgba(47,111,242,0.5),rgba(139,92,246,0.18)_45%,transparent_70%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  </div>

                  <div className="relative z-10 flex h-full min-h-[280px] flex-col p-7 [transform-style:preserve-3d]">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-500 [transform:translateZ(36px)] group-hover:border-sky-300/60 group-hover:shadow-[0_0_24px_rgba(56,189,248,0.45)]">
                      <span
                        aria-hidden="true"
                        className="icon-mask h-5 w-5 opacity-90"
                        style={{ "--icon": `url(${s.iconSrc})`, backgroundColor: "#ffffff" } as CSSProperties}
                      />
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-white">{s.title}</h3>
                    {text.subtitle && <p className="mb-2 text-[11px] tracking-wide text-sky-200/90">{text.subtitle}</p>}
                    <p className="mb-5 text-sm leading-relaxed text-white/80">{text.description}</p>
                    <div className="mt-auto mb-4 flex flex-wrap gap-2 [transform:translateZ(20px)]">
                      {s.stacks.map((stack, si) => (
                        <span
                          key={stack.name}
                          title={stack.name}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/90 transition-transform duration-300 group-hover:-translate-y-0.5 hover:scale-110"
                          style={{ transitionDelay: `${si * 30}ms` }}
                        >
                          {stack.isOpenAI ? (
                            <OpenAIMark />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={stack.src}
                              alt={stack.name}
                              className={stack.wide ? "h-4 w-7 object-contain" : "h-5 w-5 object-contain"}
                              draggable={false}
                            />
                          )}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-sky-200 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100">
                      {t.services.more} <span aria-hidden>→</span>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      <ServiceModal service={selected} onClose={() => setSelectedId(null)} />
    </section>
  );
}
