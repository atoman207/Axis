"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/PreferencesProvider";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";

type Kind = "smoke" | "soot" | "flame" | "fire" | "flash" | "spark" | "ring";

type Particle = {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  /** Starting radius (px). */
  size: number;
  /** Radius gained over the particle's life (px). */
  grow: number;
  /** Peak opacity. */
  alpha: number;
  /** Sparks: burning-orange instead of the theme's cool spark colour. */
  warm?: boolean;
};

type Mode = "light" | "space";

type Craft = {
  icon: string;
  linkIcon: string;
  /** The point that clicks (nose / dish feed), in px inside the 32px icon. */
  hotspot: [number, number];
  /** Where the trail leaves the icon, in px from the hotspot, for the art as drawn. */
  emitters: [number, number][];
  /** One puff every this many px of travel, per emitter. */
  spacing: number;
};

// The icon art (public/cursors) points up-left; the plane's engines and the
// satellite's thruster sit behind it.
const CRAFT: Record<Mode, Craft> = {
  light: {
    icon: "/cursors/airplane.svg",
    linkIcon: "/cursors/airplane-link.svg",
    hotspot: [4, 4],
    emitters: [
      [16.9, 8.4],
      [8.4, 16.9],
    ],
    spacing: 5,
  },
  space: {
    icon: "/cursors/satellite.svg",
    linkIcon: "/cursors/satellite-link.svg",
    hotspot: [8, 8],
    emitters: [[13.5, 13.5]],
    spacing: 4,
  },
};

const ICON_SIZE = 32;
/** Heading of the art as drawn: nose toward the top-left. */
const ART_HEADING = (-135 * Math.PI) / 180;
/** Trail particles stop spawning past this; explosions always get through. */
const MAX_TRAIL = 640;
const MAX_PARTICLES = 1000;
/** How long the craft is gone after blowing up. */
const RESPAWN_MS = 650;

const STYLE_ID = "flight-cursor-style";
const LINK_SELECTOR = "a[href], button:not(:disabled), [role='button'], summary, label[for], select, .cursor-pointer";
const TEXT_SELECTOR =
  "input:not([type='checkbox'], [type='radio'], [type='range'], [type='submit'], [type='button']), textarea, [contenteditable='true']";

/** True while the drawn craft replaces the system pointer (other effects can stand down). */
export function isFlightCursorActive() {
  return typeof document !== "undefined" && document.getElementById(STYLE_ID) !== null;
}

/** A soft radial sprite, pre-rendered once so each frame is only cheap drawImage calls. */
function sprite(stops: [number, string][]) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (const [offset, color] of stops) gradient.addColorStop(offset, color);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return canvas;
}

const between = (min: number, max: number) => min + Math.random() * (max - min);

/** Shortest signed turn from `from` to `to`, in radians. */
function turn(from: number, to: number) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

/**
 * The cursor as an aircraft: an airliner on the white theme, a satellite in space.
 * Exactly one craft is ever on screen — it replaces the system pointer, turns to face
 * the way the mouse is moving, and leaves a wake: two contrails of white smoke, or a
 * thruster plume that burns white-hot, cools through blue to violet and thins into
 * vapour. A click blows it up (fireball, sparks, shockwave, smoke) and a fresh one
 * appears a moment later.
 *
 * The component hides the system pointer itself (an injected style, removed on
 * cleanup), so the drawn craft and the hidden pointer can never get out of step.
 * Touch, reduced motion and no-JS visitors keep the static image cursors from
 * globals.css. Text fields keep the I-beam; the loop sleeps when nothing is moving.
 */
export default function FlightCursor() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const craftRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const craftEl = craftRef.current;
    const icon = iconRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !craftEl || !icon || !ctx || prefersReducedMotion() || !hasFinePointer()) return;

    const mode: Mode = theme === "space" ? "space" : "light";
    const craft = CRAFT[mode];
    const [hx, hy] = craft.hotspot;
    for (const src of [craft.icon, craft.linkIcon]) new Image().src = src;
    icon.src = craft.icon;
    craftEl.style.transformOrigin = `${hx}px ${hy}px`;

    // Hide the system pointer first — the craft is never shown without this in place.
    document.getElementById(STYLE_ID)?.remove();
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      "*,*::before,*::after{cursor:none!important}" +
      `:is(${TEXT_SELECTOR}){cursor:text!important}`;
    document.head.appendChild(style);

    /* ---- sprites -------------------------------------------------------- */
    // white body with a broad, soft slate shade toward the edge — like real smoke against a
    // bright sky — so overlapping puffs merge into one plume that still reads on white paper
    const smoke = sprite([
      [0, "rgba(255,255,255,0.95)"],
      [0.3, "rgba(240,244,250,0.85)"],
      [0.62, "rgba(176,188,208,0.38)"],
      [0.85, "rgba(148,163,184,0.1)"],
      [1, "rgba(148,163,184,0)"],
    ]);
    // grey-brown smoke left by an explosion
    const soot = sprite([
      [0, "rgba(96,104,120,0.8)"],
      [0.45, "rgba(118,126,142,0.5)"],
      [1, "rgba(130,138,152,0)"],
    ]);
    // plasma: white-hot → cyan, then blue → violet
    const hot = sprite([
      [0, "rgba(255,255,255,1)"],
      [0.25, "rgba(186,230,253,0.9)"],
      [0.6, "rgba(56,189,248,0.35)"],
      [1, "rgba(56,189,248,0)"],
    ]);
    const cool = sprite([
      [0, "rgba(165,180,252,0.85)"],
      [0.5, "rgba(99,102,241,0.3)"],
      [1, "rgba(139,92,246,0)"],
    ]);
    // fire: white-yellow core → orange, then orange → deep red
    const fireHot = sprite([
      [0, "rgba(255,255,236,1)"],
      [0.22, "rgba(254,240,138,0.95)"],
      [0.55, "rgba(251,146,60,0.65)"],
      [1, "rgba(239,68,68,0)"],
    ]);
    const fireCool = sprite([
      [0, "rgba(251,146,60,0.9)"],
      [0.5, "rgba(220,38,38,0.5)"],
      [1, "rgba(127,29,29,0)"],
    ]);
    // on white paper added light vanishes, so fire is painted; on the night sky it glows
    const glow: GlobalCompositeOperation = mode === "space" ? "lighter" : "source-over";

    /* ---- state ---------------------------------------------------------- */
    const particles: Particle[] = [];
    const pointer = { x: -100, y: -100 };
    const velocity = { x: 0, y: 0 };
    let last: { x: number; y: number } | null = null;
    let heading = ART_HEADING;
    let target = ART_HEADING;
    let carry = 0;
    let frame = 0;
    let running = false;
    let previous = 0;
    let width = 0;
    let height = 0;
    let shown = false;
    let overText = false;
    let exploded = false;
    let respawn = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rotation = () => heading - ART_HEADING;

    const place = () => {
      craftEl.style.transform = `translate3d(${pointer.x - hx}px, ${pointer.y - hy}px, 0) rotate(${rotation()}rad)`;
    };

    const setShown = (next: boolean) => {
      if (shown === next) return;
      shown = next;
      craftEl.style.opacity = next ? "1" : "0";
    };

    /** Where a point of the icon art (px from the hotspot) is on screen right now. */
    const onCraft = (ox: number, oy: number) => {
      const cos = Math.cos(rotation());
      const sin = Math.sin(rotation());
      return { x: pointer.x + ox * cos - oy * sin, y: pointer.y + ox * sin + oy * cos };
    };

    /* ---- trail ---------------------------------------------------------- */
    const spawnTrail = (x: number, y: number, dirX: number, dirY: number) => {
      const cos = Math.cos(rotation());
      const sin = Math.sin(rotation());
      for (const [ox, oy] of craft.emitters) {
        if (particles.length >= MAX_TRAIL) return;
        const px = x + ox * cos - oy * sin;
        const py = y + ox * sin + oy * cos;

        if (mode === "light") {
          // contrail smoke: dense at first, then spreading wide and dissolving
          particles.push({
            kind: "smoke",
            x: px + between(-1.5, 1.5),
            y: py + between(-1.5, 1.5),
            vx: -dirX * between(4, 14) + between(-7, 7),
            vy: -dirY * between(4, 14) + between(-7, 7) - 4,
            age: 0,
            life: between(1.1, 1.8),
            size: between(3.5, 6),
            grow: between(18, 30),
            alpha: between(0.42, 0.6),
          });
        } else {
          // thruster plume: thrown back against the direction of travel, burning out fast
          const speed = between(60, 120);
          const spread = between(-26, 26);
          particles.push({
            kind: "flame",
            x: px,
            y: py,
            vx: -dirX * speed - dirY * spread,
            vy: -dirY * speed + dirX * spread,
            age: 0,
            life: between(0.5, 0.9),
            size: between(2.5, 4),
            grow: between(8, 14),
            alpha: between(0.7, 0.95),
          });
          // and the vapour it leaves, lingering a little longer
          if (Math.random() < 0.55) {
            particles.push({
              kind: "smoke",
              x: px - dirX * 6,
              y: py - dirY * 6,
              vx: -dirX * between(10, 24) + between(-6, 6),
              vy: -dirY * between(10, 24) + between(-6, 6),
              age: 0,
              life: between(0.9, 1.5),
              size: between(3, 5),
              grow: between(14, 22),
              alpha: between(0.16, 0.28),
            });
          }
        }
      }
    };

    /* ---- explosion ------------------------------------------------------ */
    const explode = () => {
      // burst from the middle of the craft, not from its nose
      const { x, y } = onCraft(ICON_SIZE / 2 - hx, ICON_SIZE / 2 - hy);
      const room = MAX_PARTICLES - particles.length;
      if (room < 20) particles.splice(0, Math.min(particles.length, 80));
      const add = (p: Omit<Particle, "age">) => particles.push({ ...p, age: 0 });
      const radial = (speedMin: number, speedMax: number) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = between(speedMin, speedMax);
        return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
      };

      // the flash and the shockwave
      add({ kind: "flash", x, y, vx: 0, vy: 0, life: 0.26, size: 10, grow: 62, alpha: 1 });
      add({ kind: "ring", x, y, vx: 0, vy: 0, life: 0.6, size: 8, grow: 84, alpha: 0.9 });

      // fireball (plasma in space)
      for (let i = 0; i < 30; i++) {
        add({
          kind: mode === "space" ? "flame" : "fire",
          x: x + between(-4, 4),
          y: y + between(-4, 4),
          ...radial(70, 280),
          life: between(0.4, 0.9),
          size: between(5, 10),
          grow: between(14, 28),
          alpha: 1,
        });
      }

      // sparks and burning fragments flung outward
      for (let i = 0; i < 22; i++) {
        add({
          kind: "spark",
          x,
          y,
          ...radial(220, 520),
          life: between(0.4, 0.85),
          size: between(1.2, 2),
          grow: 0,
          alpha: 1,
          warm: mode === "light" || i % 2 === 0,
        });
      }

      // the smoke that hangs afterwards
      for (let i = 0; i < 10; i++) {
        const { vx, vy } = radial(15, 70);
        add({
          kind: mode === "space" ? "smoke" : "soot",
          x: x + between(-4, 4),
          y: y + between(-4, 4),
          vx,
          vy: vy - 18,
          life: between(1, 1.7),
          size: between(6, 10),
          grow: between(22, 38),
          alpha: mode === "space" ? between(0.2, 0.32) : between(0.35, 0.5),
        });
      }
    };

    const blowUp = () => {
      exploded = true;
      explode();
      // the craft flares and is gone
      icon.animate(
        [
          { transform: "scale(1)", opacity: 1 },
          { transform: "scale(1.7)", opacity: 0 },
        ],
        { duration: 140, easing: "ease-out", fill: "forwards" }
      );
      window.clearTimeout(respawn);
      respawn = window.setTimeout(() => {
        exploded = false;
        last = null;
        // a fresh one pops in where the pointer is now
        icon.getAnimations().forEach((animation) => animation.cancel());
        icon.animate(
          [
            { transform: "scale(0.3)", opacity: 0 },
            { transform: "scale(1.12)", opacity: 1, offset: 0.7 },
            { transform: "scale(1)", opacity: 1 },
          ],
          { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
        );
      }, RESPAWN_MS);
      wake();
    };

    /* ---- render loop ---------------------------------------------------- */
    const draw = (p: Particle, t: number) => {
      const size = p.size + p.grow * (1 - Math.pow(1 - t, 2.2));
      const fadeIn = Math.min(1, p.age / 0.04);

      switch (p.kind) {
        case "smoke":
        case "soot": {
          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = p.alpha * fadeIn * Math.pow(1 - t, 1.6);
          ctx.drawImage(p.kind === "smoke" ? smoke : soot, p.x - size, p.y - size, size * 2, size * 2);
          break;
        }
        case "flame":
        case "fire": {
          // hot core cooling outward over the particle's life
          const [hotSprite, coolSprite] = p.kind === "flame" ? [hot, cool] : [fireHot, fireCool];
          ctx.globalCompositeOperation = p.kind === "flame" ? "lighter" : glow;
          const fade = p.alpha * Math.pow(1 - t, 1.8);
          ctx.globalAlpha = fade * (1 - t);
          ctx.drawImage(hotSprite, p.x - size, p.y - size, size * 2, size * 2);
          ctx.globalAlpha = fade * t;
          ctx.drawImage(coolSprite, p.x - size, p.y - size, size * 2, size * 2);
          break;
        }
        case "flash": {
          ctx.globalCompositeOperation = glow;
          ctx.globalAlpha = p.alpha * Math.pow(1 - t, 1.4);
          const flash = mode === "space" ? hot : fireHot;
          ctx.drawImage(flash, p.x - size, p.y - size, size * 2, size * 2);
          break;
        }
        case "spark": {
          // a short streak along its flight, so it reads as a fast fragment
          ctx.globalCompositeOperation = glow;
          ctx.globalAlpha = p.alpha * Math.pow(1 - t, 1.2);
          ctx.strokeStyle = p.warm ? "rgb(251,146,60)" : "rgb(186,230,253)";
          ctx.lineWidth = p.size;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
          ctx.stroke();
          break;
        }
        case "ring": {
          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = p.alpha * Math.pow(1 - t, 1.5);
          ctx.strokeStyle = mode === "space" ? "rgb(125,211,252)" : "rgb(251,146,60)";
          ctx.lineWidth = 3 * (1 - t) + 0.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;

      // ease the nose round toward the direction of travel
      const remaining = turn(heading, target);
      heading += remaining * (1 - Math.exp(-dt * 14));
      place();

      ctx.clearRect(0, 0, width, height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += dt;
        if (p.age >= p.life) {
          particles[i] = particles[particles.length - 1];
          particles.pop();
          continue;
        }
        const drag = Math.exp(-dt * (p.kind === "smoke" || p.kind === "soot" ? 1.6 : p.kind === "spark" ? 2.4 : 4));
        p.vx *= drag;
        p.vy *= drag;
        if (p.kind === "spark") p.vy += 260 * dt; // fragments fall
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        draw(p, p.age / p.life);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // sleep once the smoke has cleared and the turn is finished
      if (particles.length > 0 || Math.abs(remaining) > 0.002) {
        frame = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    function wake() {
      if (running) return;
      running = true;
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    }

    /* ---- input ---------------------------------------------------------- */
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      setShown(!overText);
      place();
      if (overText || exploded) {
        last = null;
        return;
      }
      if (!last) {
        last = { x: pointer.x, y: pointer.y };
        return;
      }

      const dx = pointer.x - last.x;
      const dy = pointer.y - last.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 0.5) return;

      // a smoothed velocity steers, so single-pixel jitters don't spin the craft
      velocity.x = velocity.x * 0.6 + dx * 0.4;
      velocity.y = velocity.y * 0.6 + dy * 0.4;
      if (Math.hypot(velocity.x, velocity.y) > 1.2) target = Math.atan2(velocity.y, velocity.x);

      // lay puffs evenly along the path, so fast flicks still draw an unbroken trail
      const dirX = dx / distance;
      const dirY = dy / distance;
      let travelled = craft.spacing - carry;
      while (travelled <= distance) {
        spawnTrail(last.x + dirX * travelled, last.y + dirY * travelled, dirX, dirY);
        travelled += craft.spacing;
      }
      carry = distance - (travelled - craft.spacing);
      last = { x: pointer.x, y: pointer.y };
      wake();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0 || overText || exploded) return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      blowUp();
    };

    // what's under the pointer: links switch to the busier icon, text fields and
    // embedded frames hand back the system cursor
    const onPointerOver = (event: PointerEvent) => {
      const element = event.target as Element | null;
      if (!element?.closest) return;
      overText = Boolean(element.closest(TEXT_SELECTOR)) || element.tagName === "IFRAME";
      if (overText) setShown(false);
      const next = element.closest(LINK_SELECTOR) ? craft.linkIcon : craft.icon;
      if (!icon.src.endsWith(next)) icon.src = next;
    };

    const onLeave = () => {
      last = null;
      setShown(false);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(respawn);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerover", onPointerOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", resize);
      icon.getAnimations().forEach((animation) => animation.cancel());
      craftEl.style.opacity = "0";
      style.remove();
      ctx.clearRect(0, 0, width, height);
    };
  }, [theme]);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[298] h-full w-full" />
      <div
        ref={craftRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[299] h-8 w-8 opacity-0 will-change-transform"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny local SVG, swapped imperatively */}
        <img ref={iconRef} alt="" width={ICON_SIZE} height={ICON_SIZE} draggable={false} className="block h-8 w-8 select-none" />
      </div>
    </>
  );
}
