import { wavePath, type Harmonic } from "@/lib/waves";

type Line = {
  baseline: number;
  harmonics: Harmonic[];
  /** Seconds for one full slide (-50%). */
  duration: number;
  opacity: number;
  width: number;
  reverse?: boolean;
  /** Seconds for one slow rise-and-fall. */
  bob: number;
};

// Strands of light silk at the foot of the screen, each on its own rhythm.
const LINES: Line[] = [
  { baseline: 64, harmonics: [[2, 22, 0], [6, 5, 1.3]], duration: 46, opacity: 0.5, width: 1.2, bob: 11 },
  { baseline: 74, harmonics: [[2, 26, 1.9], [4, 7, 0.4]], duration: 64, opacity: 0.32, width: 1, reverse: true, bob: 14 },
  { baseline: 86, harmonics: [[4, 14, 3.1], [2, 18, 0.7]], duration: 38, opacity: 0.4, width: 1, bob: 9 },
  { baseline: 96, harmonics: [[2, 30, 4.2]], duration: 82, opacity: 0.24, width: 1.6, reverse: true, bob: 17 },
  { baseline: 108, harmonics: [[4, 10, 2.2], [8, 3, 0.9]], duration: 54, opacity: 0.3, width: 0.9, bob: 12 },
];

const VIEW_W = 2880;
const VIEW_H = 160;

const BODY = wavePath({ width: VIEW_W, height: VIEW_H, baseline: 112, harmonics: [[2, 16, 2.6], [4, 6, 0.8]], closed: true });

/**
 * Flowing silk-like wave lines along the bottom of the white theme's backdrop.
 * Each strand is a seamless periodic SVG slid sideways by CSS (compositor only)
 * while it slowly rises and falls; reduced motion leaves them still.
 */
export default function SilkWaves() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[20vh] min-h-[120px] overflow-hidden md:h-[26vh] md:min-h-[170px]">
      <div className="silk-bob absolute inset-0" style={{ animationDuration: "15s" }}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="silk-drift absolute bottom-0 left-0 h-full w-[200%]"
          style={{ animationDuration: "70s" }}
        >
          <defs>
            <linearGradient id="silk-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5691fb" stopOpacity="0.07" />
              <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={BODY} fill="url(#silk-body)" />
        </svg>
      </div>

      {LINES.map((line, i) => (
        <div key={i} className="silk-bob absolute inset-0" style={{ animationDuration: `${line.bob}s`, animationDelay: `${-i * 2.3}s` }}>
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="none"
            className="silk-drift absolute bottom-0 left-0 h-full w-[200%]"
            style={{
              animationDuration: `${line.duration}s`,
              animationDirection: line.reverse ? "reverse" : "normal",
              opacity: line.opacity,
            }}
          >
            <defs>
              {/* periodic stops, so the colour lines up again after every -50% slide */}
              <linearGradient id={`silk-${i}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={VIEW_W} y2="0">
                <stop offset="0" stopColor="#2f6ff2" />
                <stop offset="0.25" stopColor="#8b5cf6" />
                <stop offset="0.5" stopColor="#2f6ff2" />
                <stop offset="0.75" stopColor="#38bdf8" />
                <stop offset="1" stopColor="#2f6ff2" />
              </linearGradient>
            </defs>
            <path
              d={wavePath({ width: VIEW_W, baseline: line.baseline, harmonics: line.harmonics })}
              fill="none"
              stroke={`url(#silk-${i})`}
              strokeWidth={line.width}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
