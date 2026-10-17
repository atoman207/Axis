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
};

export default function SectionHeading({ eyebrow, title, lead, align = "left", className = "" }: Props) {
  const centered = align === "center";
  const lines = Array.isArray(title) ? title : [title];

  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      <SectionEyebrow align={align}>{eyebrow}</SectionEyebrow>
      <h2 className="text-2xl font-bold leading-snug sm:text-3xl md:text-4xl">
        <MaskLines lines={lines} delay={0.08} />
      </h2>
      {lead && (
        <Reveal delay={0.22} y={16}>
          <p className={`mt-4 text-sm leading-loose text-muted md:text-base ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}
