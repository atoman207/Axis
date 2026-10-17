"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useRef, useState, type CSSProperties, type FocusEvent, type PointerEvent } from "react";
import OpenAIMark from "@/components/OpenAIMark";
import { useI18n } from "@/components/PreferencesProvider";
import { useGsap } from "@/lib/gsap";
import { EASE_OUT } from "@/lib/motion";
import { devicon, lucide, simpleIcon, type TechItem } from "@/lib/tech-icons";
import { useMediaQuery } from "@/lib/use-media-query";

type LayerId = "ai" | "frontend" | "backend" | "database" | "cloud";

type Layer = { id: LayerId; title: string; icon: string; stack: TechItem[] };

/** In reading order (top → bottom, left → right) so keyboard focus follows the picture. */
const LAYERS: Layer[] = [
  {
    id: "cloud",
    title: "Cloud",
    icon: lucide("cloud-cog"),
    stack: [
      { name: "AWS", src: devicon("amazonwebservices/amazonwebservices-original-wordmark.svg"), wide: true },
      { name: "Azure", src: devicon("azure/azure-original.svg") },
      { name: "GCP", src: devicon("googlecloud/googlecloud-original.svg") },
      { name: "Docker", src: devicon("docker/docker-original.svg") },
      { name: "Kubernetes", src: devicon("kubernetes/kubernetes-plain.svg") },
      { name: "Terraform", src: devicon("terraform/terraform-original.svg") },
    ],
  },
  {
    id: "frontend",
    title: "Frontend",
    icon: lucide("monitor-smartphone"),
    stack: [
      { name: "React", src: devicon("react/react-original.svg") },
      { name: "Next.js", src: simpleIcon("nextdotjs", "000000") },
      { name: "TypeScript", src: devicon("typescript/typescript-original.svg") },
      { name: "Vue.js", src: devicon("vuejs/vuejs-original.svg") },
      { name: "Tailwind", src: devicon("tailwindcss/tailwindcss-original.svg") },
    ],
  },
  {
    id: "ai",
    title: "AI",
    icon: lucide("brain-circuit"),
    stack: [
      { name: "OpenAI", isOpenAI: true },
      { name: "Claude", src: simpleIcon("anthropic", "D4A27F") },
      { name: "Gemini", src: simpleIcon("googlegemini", "8E75F0") },
      { name: "LangChain", src: simpleIcon("langchain", "1C3C3C") },
      { name: "Python", src: devicon("python/python-original.svg") },
    ],
  },
  {
    id: "backend",
    title: "Backend",
    icon: lucide("server-cog"),
    stack: [
      { name: "Node.js", src: devicon("nodejs/nodejs-original.svg") },
      { name: "FastAPI", src: devicon("fastapi/fastapi-original.svg") },
      { name: "Laravel", src: devicon("laravel/laravel-original.svg") },
      { name: "Go", src: devicon("go/go-original-wordmark.svg"), wide: true },
      { name: "GraphQL", src: devicon("graphql/graphql-plain.svg") },
    ],
  },
  {
    id: "database",
    title: "Database",
    icon: lucide("database"),
    stack: [
      { name: "PostgreSQL", src: devicon("postgresql/postgresql-original.svg") },
      { name: "MySQL", src: devicon("mysql/mysql-original.svg") },
      { name: "MongoDB", src: devicon("mongodb/mongodb-original.svg") },
      { name: "Redis", src: devicon("redis/redis-original.svg") },
      { name: "Supabase", src: simpleIcon("supabase", "3FCF8E") },
    ],
  },
];

type Edge = {
  from: LayerId;
  to: LayerId;
  /** Technical name of what travels along the connection. */
  label: string;
  /** Outer ring connections curve around the AI core instead of running through it. */
  ring?: boolean;
  /** Request and response: packets travel both ways. */
  twoWay?: boolean;
  /** Where the label sits along a straight connection, 0 (from) → 1 (to). */
  labelAt?: number;
};

const EDGES: Edge[] = [
  { from: "frontend", to: "ai", label: "Prompt · Stream", twoWay: true },
  { from: "ai", to: "backend", label: "Tools · API", twoWay: true },
  // kept clear of the core's own caption
  { from: "database", to: "ai", label: "RAG · Vector", twoWay: true, labelAt: 0.4 },
  { from: "cloud", to: "ai", label: "GPU · Inference" },
  { from: "cloud", to: "frontend", label: "CDN · Edge", ring: true },
  { from: "cloud", to: "backend", label: "CI/CD", ring: true },
  { from: "backend", to: "database", label: "SQL · Cache", ring: true, twoWay: true },
  { from: "database", to: "frontend", label: "Realtime", ring: true },
];

type Layout = {
  w: number;
  h: number;
  nodes: Record<LayerId, [number, number]>;
  /** How far ring connections bow outward, as a share of their distance from the core. */
  bow: number;
  /** Orbit radius around the core, in viewBox units. */
  coreR: number;
  /** Orb sizes in px: satellites and the AI core. */
  orb: number;
  coreOrb: number;
  labels: boolean;
};

const WIDE: Layout = {
  w: 1000,
  h: 580,
  nodes: { cloud: [500, 80], frontend: [150, 290], ai: [500, 290], backend: [850, 290], database: [500, 488] },
  bow: 0.5,
  coreR: 82,
  orb: 72,
  coreOrb: 104,
  labels: true,
};

const NARROW: Layout = {
  w: 400,
  h: 470,
  nodes: { cloud: [200, 56], frontend: [58, 228], ai: [200, 228], backend: [342, 228], database: [200, 398] },
  bow: 0.42,
  coreR: 52,
  orb: 50,
  coreOrb: 70,
  labels: false,
};

function edgeGeometry(layout: Layout, edge: Edge) {
  const [x1, y1] = layout.nodes[edge.from];
  const [x2, y2] = layout.nodes[edge.to];
  const [cx, cy] = layout.nodes.ai;

  if (!edge.ring) {
    const at = edge.labelAt ?? 0.5;
    const mx = x1 + (x2 - x1) * at;
    const my = y1 + (y2 - y1) * at;
    const horizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1);
    return {
      d: `M${x1} ${y1} L${x2} ${y2}`,
      label: horizontal ? { x: mx, y: my - 12, anchor: "middle" as const } : { x: mx + 14, y: my + 4, anchor: "start" as const },
    };
  }

  // Quadratic curve whose control point is pushed away from the core.
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const qx = mx + (mx - cx) * layout.bow;
  const qy = my + (my - cy) * layout.bow;
  // Point on the curve at t = 0.5, nudged outward for the label.
  const px = 0.25 * x1 + 0.5 * qx + 0.25 * x2;
  const py = 0.25 * y1 + 0.5 * qy + 0.25 * y2;
  const len = Math.hypot(px - cx, py - cy) || 1;
  return {
    d: `M${x1} ${y1} Q${qx} ${qy} ${x2} ${y2}`,
    label: { x: px + ((px - cx) / len) * 16, y: py + ((py - cy) / len) * 16 + 4, anchor: "middle" as const },
  };
}

function StackTile({ tech }: { tech: TechItem }) {
  return (
    <li
      title={tech.name}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white shadow-sm transition-transform duration-300 hover:-translate-y-0.5"
    >
      {tech.isOpenAI ? (
        <OpenAIMark size={22} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={tech.src}
          alt={tech.name}
          className={tech.wide ? "h-5 w-8 object-contain" : "h-6 w-6 object-contain"}
          draggable={false}
          loading="lazy"
        />
      )}
    </li>
  );
}

/**
 * Interactive system map: AI at the core, linked to frontend, backend, database and
 * cloud. Connections draw in when the map scrolls into view, then data packets keep
 * flowing along them; hovering, focusing or tapping a layer lights up its links.
 */
export default function TechArchitecture() {
  const { t } = useI18n();
  const copy = t.technology.architecture;
  const wide = useMediaQuery("(min-width: 768px)");
  const layout = wide ? WIDE : NARROW;

  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<LayerId>("ai");
  // Highlighting only while someone is exploring; at rest every connection glows evenly.
  const [engaged, setEngaged] = useState(false);

  // useId output can contain characters that break `url(#…)` references.
  const uid = `arch${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const gradientId = `${uid}-edge`;
  const panelId = `${uid}-panel`;

  useGsap(rootRef, ({ gsap, ScrollTrigger, reduced }) => {
    const root = rootRef.current;
    if (!root) return;

    // Packets only run while the map is on screen.
    ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => root.classList.toggle("is-paused", !self.isActive),
    });

    if (reduced) {
      root.classList.add("is-live");
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: { trigger: root, start: "top 78%", once: true },
      defaults: { ease: "power3.out" },
    });
    tl.from(".arch-core", { scale: 0.4, opacity: 0, duration: 0.9, ease: "back.out(1.5)" })
      .from(".arch-orbits", { opacity: 0, duration: 1.2 }, "<0.15")
      .from(".arch-edge-base", { strokeDashoffset: 100, duration: 1.2, stagger: 0.07, ease: "power2.inOut" }, "<")
      .from(".arch-satellite", { opacity: 0, scale: 0.7, y: 16, duration: 0.8, stagger: 0.08, ease: "back.out(1.6)" }, "-=1")
      .call(() => root.classList.add("is-live"), [], "-=0.4")
      .from(".arch-edge-label", { opacity: 0, duration: 0.6, stagger: 0.04 }, "<");
  }, []);

  const connected = (id: LayerId) =>
    EDGES.some((edge) => (edge.from === active && edge.to === id) || (edge.to === active && edge.from === id));

  const nodeState = (id: LayerId) => {
    if (!engaged) return id === active ? "active" : "idle";
    if (id === active) return "active";
    return connected(id) ? "near" : "dim";
  };

  const select = (id: LayerId) => {
    setActive(id);
    setEngaged(true);
  };

  const handleLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") setEngaged(false);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setEngaged(false);
  };

  const activeLayer = LAYERS.find((layer) => layer.id === active) ?? LAYERS[2];
  const activeCopy = copy.layers[active];

  return (
    <div>
      <div
        ref={rootRef}
        role="group"
        aria-label={copy.diagramLabel}
        onPointerLeave={handleLeave}
        onBlur={handleBlur}
        className="arch relative mx-auto w-full max-w-5xl"
        style={{ aspectRatio: `${layout.w} / ${layout.h}` }}
      >
        <svg
          aria-hidden
          viewBox={`0 0 ${layout.w} ${layout.h}`}
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <defs>
            {/* userSpaceOnUse: a perfectly straight line has a zero-height box and would lose a bounding-box gradient */}
            <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={layout.w} y2={layout.h}>
              <stop offset="0%" stopColor="#2f6ff2" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          <g className="arch-orbits">
            <circle
              className="arch-orbit"
              cx={layout.nodes.ai[0]}
              cy={layout.nodes.ai[1]}
              r={layout.coreR}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeOpacity={0.55}
              strokeDasharray="2 7"
            />
            <circle
              className="arch-orbit arch-orbit--reverse"
              cx={layout.nodes.ai[0]}
              cy={layout.nodes.ai[1]}
              r={layout.coreR * 1.45}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeOpacity={0.25}
              strokeDasharray="1 10"
            />
          </g>

          {EDGES.map((edge, i) => {
            const { d, label } = edgeGeometry(layout, edge);
            const linked = edge.from === active || edge.to === active;
            const state = !engaged ? "idle" : linked ? "on" : "dim";
            const pace = { "--pulse-dur": `${3 + (i % 4) * 0.45}s`, "--pulse-delay": `${-i * 0.75}s` } as CSSProperties;
            const returnPace = { "--pulse-dur": `${3.4 + (i % 3) * 0.5}s`, "--pulse-delay": `${-i * 0.75 - 1.6}s` } as CSSProperties;

            return (
              <g key={`${edge.from}-${edge.to}`} className="arch-edge" data-state={state}>
                <path className="arch-edge-base" d={d} pathLength={100} stroke={`url(#${gradientId})`} />
                <g className="arch-packet" style={pace}>
                  <path className="arch-edge-glow" d={d} pathLength={100} stroke={`url(#${gradientId})`} />
                  <path className="arch-edge-pulse" d={d} pathLength={100} style={{ stroke: "var(--arch-pulse)" }} />
                </g>
                {edge.twoWay && (
                  <g className="arch-packet arch-packet--back" style={returnPace}>
                    <path className="arch-edge-glow" d={d} pathLength={100} stroke={`url(#${gradientId})`} />
                    <path className="arch-edge-pulse" d={d} pathLength={100} style={{ stroke: "var(--arch-pulse)" }} />
                  </g>
                )}
                {layout.labels && (
                  <text className="arch-edge-label" x={label.x} y={label.y} textAnchor={label.anchor}>
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {LAYERS.map((layer) => {
          const [x, y] = layout.nodes[layer.id];
          const isCore = layer.id === "ai";
          const state = nodeState(layer.id);
          const orb = isCore ? layout.coreOrb : layout.orb;

          return (
            <div
              key={layer.id}
              className="absolute z-10 [translate:-50%_calc(var(--orb)/-2)]"
              style={{ left: `${(x / layout.w) * 100}%`, top: `${(y / layout.h) * 100}%`, "--orb": `${orb}px` } as CSSProperties}
            >
              <div className={isCore ? "arch-core" : "arch-satellite"}>
                <button
                  type="button"
                  aria-pressed={active === layer.id}
                  aria-controls={panelId}
                  onClick={() => select(layer.id)}
                  onFocus={() => select(layer.id)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") select(layer.id);
                  }}
                  data-state={state}
                  className={`group/node flex flex-col items-center gap-2 rounded-2xl transition-opacity duration-500 focus-visible:outline-none data-[state=dim]:opacity-45 ${
                    isCore ? "" : "md:gap-2.5"
                  }`}
                >
                  {isCore ? (
                    <span
                      className="relative flex h-[var(--orb)] w-[var(--orb)] items-center justify-center rounded-full bg-[radial-gradient(circle_at_32%_26%,#8ab6ff_0%,#2f6ff2_42%,#5b3bd6_100%)] shadow-[0_0_36px_rgba(47,111,242,0.55),0_0_80px_rgba(139,92,246,0.35)] ring-1 ring-white/30 transition-transform duration-500 group-hover/node:scale-105 group-focus-visible/node:ring-2 group-focus-visible/node:ring-sky-300"
                    >
                      <span aria-hidden className="arch-halo absolute inset-0 rounded-full border border-sky-400/60" />
                      <span aria-hidden className="arch-halo arch-halo--late absolute inset-0 rounded-full border border-violet-400/50" />
                      {/* a light that circles the core */}
                      <span
                        aria-hidden
                        className="absolute -inset-1.5 animate-[arch-spin_7s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(125,211,252,0.9)_60deg,transparent_140deg,transparent_200deg,rgba(167,139,250,0.9)_260deg,transparent_340deg)] [mask:radial-gradient(farthest-side,transparent_calc(100%-2px),#000_calc(100%-1px))]"
                      />
                      <span
                        aria-hidden
                        className="icon-mask h-[42%] w-[42%]"
                        style={{ "--icon": `url(${layer.icon})`, backgroundColor: "#ffffff" } as CSSProperties}
                      />
                    </span>
                  ) : (
                    <span
                      className={`relative flex h-[var(--orb)] w-[var(--orb)] items-center justify-center rounded-2xl border bg-popover/90 backdrop-blur transition-[transform,box-shadow,border-color] duration-500 group-hover/node:-translate-y-0.5 group-focus-visible/node:ring-2 group-focus-visible/node:ring-sky-400 ${
                        state === "active" && engaged
                          ? "-translate-y-0.5 scale-105 border-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.14),0_14px_34px_-10px_rgba(47,111,242,0.55),0_0_28px_rgba(139,92,246,0.3)]"
                          : state === "near"
                            ? "border-shu-300 shadow-[0_10px_26px_-12px_rgba(47,111,242,0.45)]"
                            : "border-line shadow-[0_8px_24px_-14px_rgba(11,23,48,0.35)]"
                      }`}
                    >
                      <span
                        aria-hidden
                        className="icon-mask h-[44%] w-[44%]"
                        style={{ "--icon": `url(${layer.icon})` } as CSSProperties}
                      />
                    </span>
                  )}
                  {/* page-coloured backing so connections pass cleanly behind the caption */}
                  <span className="flex flex-col items-center rounded-md bg-background/85 px-1.5 py-0.5 leading-tight backdrop-blur-[2px]">
                    <span className="text-[10px] font-semibold tracking-[0.18em] text-sumi uppercase md:text-xs">
                      {layer.title}
                    </span>
                    <span className="mt-1 hidden text-[11px] text-faint md:block">{copy.layers[layer.id].label}</span>
                  </span>
                </button>
              </div>
            </div>
          );
        })}

        {/* The picture is decorative for assistive tech; the connections are listed here instead. */}
        <ul className="sr-only">
          {EDGES.map((edge) => {
            const from = LAYERS.find((layer) => layer.id === edge.from)?.title;
            const to = LAYERS.find((layer) => layer.id === edge.to)?.title;
            return <li key={`${edge.from}-${edge.to}`}>{`${from} → ${to}: ${edge.label}`}</li>;
          })}
        </ul>
      </div>

      <p className="mt-4 text-center text-xs text-faint md:mt-2">{copy.hint}</p>

      <div id={panelId} aria-live="polite" className="mx-auto mt-6 max-w-3xl">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-[0_18px_50px_-30px_rgba(11,23,48,0.35)] md:p-7"
          >
            <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-shu-500 via-sky-400 to-violet-500" />
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.28em] text-accent uppercase">{activeLayer.title}</p>
                <h3 className="mt-1 text-lg font-bold text-sumi md:text-xl">{activeCopy.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{activeCopy.description}</p>
              </div>
              <div className="shrink-0">
                <p className="mb-2 text-[10px] tracking-[0.22em] text-faint uppercase">{copy.stackLabel}</p>
                <ul className="flex flex-wrap gap-2">
                  {activeLayer.stack.map((tech) => (
                    <StackTile key={tech.name} tech={tech} />
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
