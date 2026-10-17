"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { EASE_OUT_CSS, prefersReducedMotion } from "@/lib/motion";

/** Page shown last; null until the first, server-rendered page has hydrated. */
let shownPath: string | null = null;

/**
 * Mounted by app/template.tsx, so it remounts on every route change.
 * Client navigations ease the new page in; the first load paints immediately
 * so server HTML is never hidden behind JavaScript.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    const previous = shownPath;
    shownPath = pathname;

    const el = ref.current;
    if (previous === null || previous === pathname || !el || prefersReducedMotion()) return;

    el.animate(
      [
        { opacity: 0, transform: "translate3d(0, 18px, 0)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 700, easing: EASE_OUT_CSS }
    );
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
