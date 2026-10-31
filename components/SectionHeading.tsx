import type { ReactNode } from "react";
import MaskLines from "@/components/motion/MaskLines";
import Reveal from "@/components/Reveal";
import SectionEyebrow from "@/components/SectionEyebrow";

type Props = {
  /** Short English label shown above the title, in every language. */
  eyebrow: string;
  /** One line, or an array of lines that each rise out of their own mask. */
  title: ReactNode | ReactNode[];
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
  /** The large outlined English word behind the heading. */
  watermark?: boolean;
};

export default function SectionHeading({ eyebrow, title, lead, align = "left", className = "", watermark = true }: Props) {
  const centered = align === "center";
  const lines = Array.isArray(title) ? title : [title];

  return (
    <div className={`relative isolate ${centered ? "text-center" : ""} ${className}`}>
      {watermark && (
        <span
          aria-hidden
          className={`section-watermark pointer-events-none absolute -top-[0.62em] z-0 hidden select-none text-[clamp(4.5rem,8.5vw,8.5rem)] md:block ${
            centered ? "left-1/2 -translate-x-1/2" : "-left-[0.05em]"
          }`}
        >
          {eyebrow}
        </span>
      )}
      <div className="relative z-10">
        <SectionEyebrow align={align}>{eyebrow}</SectionEyebrow>
        <h2 className="text-2xl font-bold leading-[1.6] sm:text-3xl md:text-[2.5rem]">
          <MaskLines lines={lines} delay={0.08} />
        </h2>
        {lead && (
          <Reveal delay={0.22} y={16}>
            <p className={`mt-6 text-sm leading-[2.1] text-muted md:text-[0.9375rem] ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
              {lead}
            </p>
          </Reveal>
        )}
      </div>
    </div>
  );
}
