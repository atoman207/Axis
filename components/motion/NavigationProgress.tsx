"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { EASE_OUT_CSS } from "@/lib/motion";

/** Give up on a navigation that never lands (blocked, offline…) after this long. */
const STALL_MS = 10_000;

function isPageLink(event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  const link = (event.target as Element | null)?.closest?.("a[href]");
  if (!(link instanceof HTMLAnchorElement)) return false;
  if ((link.target && link.target !== "_self") || link.hasAttribute("download")) return false;

  const url = new URL(link.href, window.location.href);
  return url.origin === window.location.origin && url.pathname !== window.location.pathname;
}

/** Freeze the bar where it is so the next animation starts from there. */
function settle(bar: HTMLElement) {
  for (const animation of bar.getAnimations()) {
    try {
      animation.commitStyles();
    } catch {
      // Nothing to keep if the bar is not being rendered.
    }
    animation.cancel();
  }
}

/**
 * A thin blue→violet light along the top of the viewport while a page loads:
 * it starts on the click, eases toward the end, and completes when the route changes.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef(false);
  const stallRef = useRef<number | undefined>(undefined);
  const firstRef = useRef(true);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const finish = () => {
      pendingRef.current = false;
      settle(bar);
      bar
        .animate([{ transform: "scaleX(1)", opacity: 1 }, { transform: "scaleX(1)", opacity: 0 }], {
          duration: 420,
          delay: 160,
          easing: "ease-out",
          fill: "forwards",
        })
        .finished.then(() => {
          settle(bar);
          bar.style.transform = "scaleX(0)";
        })
        .catch(() => {});
      bar.style.transform = "scaleX(1)";
    };

    const onClick = (event: MouseEvent) => {
      if (!isPageLink(event)) return;
      pendingRef.current = true;
      settle(bar);
      bar.style.opacity = "1";
      bar.animate([{ transform: "scaleX(0.04)" }, { transform: "scaleX(0.82)" }], {
        duration: 2600,
        easing: "cubic-bezier(0.1, 0.7, 0.2, 1)",
        fill: "forwards",
      });
      window.clearTimeout(stallRef.current);
      stallRef.current = window.setTimeout(finish, STALL_MS);
    };

    // Capture phase: Next's <Link> cancels the click before it would bubble up here.
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(stallRef.current);
    };
  }, []);

  useEffect(() => {
    const bar = barRef.current;
    if (firstRef.current || !bar) {
      firstRef.current = false;
      return;
    }

    window.clearTimeout(stallRef.current);
    settle(bar);

    // Back/forward navigations never clicked a link: give them a quick full sweep.
    const from = pendingRef.current ? getComputedStyle(bar).transform : "scaleX(0)";
    pendingRef.current = false;

    bar.style.opacity = "1";
    bar
      .animate(
        [
          { transform: from === "none" ? "scaleX(0)" : from, opacity: 1 },
          { transform: "scaleX(1)", opacity: 1, offset: 0.55 },
          { transform: "scaleX(1)", opacity: 0 },
        ],
        { duration: 700, easing: EASE_OUT_CSS, fill: "forwards" }
      )
      .finished.then(() => {
        settle(bar);
        bar.style.transform = "scaleX(0)";
        bar.style.opacity = "0";
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <div
      ref={barRef}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-shu-500 via-sky-400 to-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.7),0_0_4px_rgba(56,189,248,0.9)]"
      style={{ transform: "scaleX(0)", opacity: 0 }}
    />
  );
}
