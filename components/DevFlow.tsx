"use client";

import { motion } from "framer-motion";
import { useLayoutEffect, useRef, type CSSProperties } from "react";
import MaskLines from "@/components/motion/MaskLines";
import { useI18n } from "@/components/PreferencesProvider";
import Reveal from "@/components/Reveal";
import SectionEyebrow from "@/components/SectionEyebrow";
import { useGsap } from "@/lib/gsap";
import { EASE_OUT } from "@/lib/motion";
import { lucide } from "@/lib/tech-icons";

const STAGES = [
  { key: "requirement",  step: "01", title: "Requirement",  icon: lucide("clipboard-list") },
  { key: "architecture", step: "02", title: "Architecture", icon: lucide("network") },
  { key: "design",       step: "03", title: "Design",       icon: lucide("palette") },
  { key: "development",  step: "04", title: "Development",  icon: lucide("code-xml") },
  { key: "testing",      step: "05", title: "Testing",      icon: lucide("shield-check") },
  { key: "deployment",   step: "06", title: "Deployment",   icon: lucide("rocket") },
  { key: "maintenance",  step: "07", title: "Maintenance",  icon: lucide("wrench") },
] as const;

/** Layout position of `el` inside `ancestor`, ignoring transforms (entrance animations move things). */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
}

/**
 * The seven development stages joined by a glowing line that fills as you scroll —
 * left to right on desktop, top to bottom on phones — lighting each stage it reaches.
 */
export default function DevFlow() {
  const { t } = useI18n();
  const listRef = useRef<HTMLOListElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  /** Where each stage sits along the track, 0 → 1. */
  const stopsRef = useRef<number[]>([]);

  // Lay the track from the first stage's centre to the last one's, in whichever direction the list runs.
  useLayoutEffect(() => {
    const list = listRef.current;
    const track = trackRef.current;
    if (!list || !track) return;

    const measure = () => {
      const nodes = Array.from(list.querySelectorAll<HTMLElement>("[data-node]"));
      if (nodes.length < 2) return;
      const centers = nodes.map((node) => offsetWithin(node, list));
      const first = centers[0];
      const last = centers[centers.length - 1];
      const horizontal = Math.abs(last.x - first.x) > Math.abs(last.y - first.y);
      const span = (horizontal ? last.x - first.x : last.y - first.y) || 1;

      track.dataset.axis = horizontal ? "x" : "y";
      track.style.left = `${first.x}px`;
      track.style.top = `${first.y}px`;
      track.style.width = horizontal ? `${span}px` : "";
      track.style.height = horizontal ? "" : `${span}px`;
      stopsRef.current = centers.map((c) => (horizontal ? c.x - first.x : c.y - first.y) / span);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  useGsap(listRef, ({ gsap, reduced }) => {
    const list = listRef.current;
    if (!list) return;
    const stages = Array.from(list.querySelectorAll<HTMLElement>("[data-stage]"));

    const apply = (progress: number) => {
      list.style.setProperty("--flow", progress.toFixed(4));
      list.style.setProperty("--flow-head", progress > 0.002 && progress < 0.998 ? "1" : "0");
      stages.forEach((stage, i) => {
        const stop = stopsRef.current[i] ?? 1;
        stage.toggleAttribute("data-reached", progress > 0.001 && progress >= stop - 0.005);
      });
    };

    if (reduced) {
      apply(1);
      return;
    }

    const state = { progress: 0 };
    apply(0);
    gsap.to(state, {
      progress: 1,
      ease: "none",
      onUpdate: () => apply(state.progress),
      scrollTrigger: { trigger: list, start: "top 78%", end: "bottom 45%", scrub: 0.8 },
    });
  }, []);

  return (
    <div>
      <div className="mb-12 text-center md:mb-16">
        <SectionEyebrow align="center">Development Flow</SectionEyebrow>
        <h3 className="text-2xl font-bold text-sumi md:text-3xl">
          <MaskLines lines={[t.technology.flowTitle]} delay={0.08} />
        </h3>
        <Reveal delay={0.2} y={14}>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-loose text-muted">{t.technology.flowLead}</p>
        </Reveal>
      </div>

      <ol ref={listRef} className="relative grid grid-cols-1 gap-8 lg:grid-cols-7 lg:gap-3">
        <span ref={trackRef} aria-hidden className="flow-track" data-axis="y">
          <span className="flow-fill" />
          <span className="flow-head" />
        </span>

        {STAGES.map((stage, i) => (
          <motion.li
            key={stage.key}
            data-stage
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.75, delay: 0.05 * i, ease: EASE_OUT }}
            className="group relative flex items-start gap-4 lg:flex-col lg:items-center lg:gap-4 lg:text-center"
          >
            <span
              data-node
              className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-strong bg-popover transition-[border-color,box-shadow,transform] duration-500 group-hover:-translate-y-0.5 group-data-[reached]:border-sky-400 group-data-[reached]:shadow-[0_0_0_4px_rgba(56,189,248,0.14),0_0_24px_rgba(139,92,246,0.45)] lg:h-14 lg:w-14"
            >
              {/* one ring of light the moment the line arrives */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-full border border-sky-400 opacity-0 group-data-[reached]:animate-[flow-ping_1s_ease-out_1]"
              />
              <span
                aria-hidden
                className="icon-mask h-5 w-5 opacity-45 transition-opacity duration-500 group-data-[reached]:opacity-100 lg:h-6 lg:w-6"
                style={{ "--icon": `url(${stage.icon})` } as CSSProperties}
              />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-popover text-[9px] leading-none font-bold text-faint transition-colors duration-500 group-data-[reached]:border-transparent group-data-[reached]:bg-gradient-to-br group-data-[reached]:from-shu-500 group-data-[reached]:to-violet-500 group-data-[reached]:text-white">
                {i + 1}
              </span>
            </span>

            <div className="pt-0.5 lg:pt-0">
              <div className="font-mono text-xs text-faint transition-colors duration-500 group-data-[reached]:text-accent">
                {stage.step}
              </div>
              <div className="text-sm font-semibold text-sumi">{stage.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-faint">{t.technology.flow[stage.key]}</div>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
