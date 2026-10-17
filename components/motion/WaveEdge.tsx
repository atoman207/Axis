import { wavePath, type Harmonic } from "@/lib/waves";

type Layer = { baseline: number; harmonics: Harmonic[]; duration: number; opacity: number; reverse?: boolean };

// Three swells, back to front: the farther ones are fainter and slower.
const LAYERS: Layer[] = [
  { baseline: 36, harmonics: [[2, 14, 0.6], [4, 5, 2.1]], duration: 30, opacity: 0.3 },
  { baseline: 50, harmonics: [[2, 12, 2.4], [6, 4, 0.3]], duration: 21, opacity: 0.55, reverse: true },
  { baseline: 64, harmonics: [[2, 10, 4], [4, 4, 1.2]], duration: 14, opacity: 1 },
];

const VIEW_W = 2880;
const VIEW_H = 100;

type Props = {
  /** "bottom" rises from the foot of a dark block; "top" pours over its upper edge. */
  edge: "top" | "bottom";
  className?: string;
};

/**
 * Animated, layered waves in the page colour along the edge of a dark block, so it
 * melts into the page like a shoreline. White theme only: on the night sky a solid
 * edge would show a seam against the stars.
 */
export default function WaveEdge({ edge, className = "" }: Props) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 overflow-hidden space:hidden ${
        edge === "bottom" ? "bottom-0" : "top-0 rotate-180"
      } ${className}`}
    >
      {LAYERS.map((layer, i) => (
        <svg
          key={i}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="silk-drift absolute bottom-0 left-0 h-full w-[200%]"
          style={{
            animationDuration: `${layer.duration}s`,
            animationDirection: layer.reverse ? "reverse" : "normal",
            opacity: layer.opacity,
          }}
        >
          <path
            d={wavePath({ width: VIEW_W, height: VIEW_H + 1, baseline: layer.baseline, harmonics: layer.harmonics, closed: true })}
            style={{ fill: "var(--background)" }}
          />
        </svg>
      ))}
    </div>
  );
}
