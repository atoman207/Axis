/** One sine component of a wave: whole periods across the path, height, phase in radians. */
export type Harmonic = [periods: number, amplitude: number, phase: number];

type WaveOptions = {
  /** Path width in SVG units. The SVG is drawn at 200% width and slid by -50% to loop. */
  width?: number;
  /** Bottom of the closed shape (for filled waves). */
  height?: number;
  baseline: number;
  /** Use even period counts only, so both halves match and the -50% loop is seamless. */
  harmonics: Harmonic[];
  /** Close the path down to `height` for a filled wave; otherwise it is a line. */
  closed?: boolean;
  step?: number;
};

/** A horizontally periodic wave as an SVG path string (deterministic, so SSR and client agree). */
export function wavePath({ width = 2880, height = 100, baseline, harmonics, closed = false, step = 30 }: WaveOptions) {
  const points: string[] = [];
  for (let x = 0; x <= width; x += step) {
    let y = baseline;
    for (const [periods, amplitude, phase] of harmonics) {
      y += Math.sin((x / width) * periods * Math.PI * 2 + phase) * amplitude;
    }
    points.push(`${points.length === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`);
  }
  if (closed) points.push(`L${width} ${height} L0 ${height} Z`);
  return points.join(" ");
}
