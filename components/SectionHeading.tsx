import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

type Props = {
  /** Short English label shown above the title, in every language. */
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeading({ eyebrow, title, lead, align = "left", className = "" }: Props) {
  const centered = align === "center";

  return (
    <Reveal className={`${centered ? "text-center" : ""} ${className}`}>
      <p className={`mb-4 flex items-center gap-3 text-xs font-medium tracking-[0.3em] text-accent uppercase ${centered ? "justify-center" : ""}`}>
        <span aria-hidden className="h-px w-8 bg-accent" />
        {eyebrow}
      </p>
      <h2 className="text-2xl font-bold leading-snug sm:text-3xl md:text-4xl">{title}</h2>
      {lead && (
        <p className={`mt-4 text-sm leading-loose text-muted md:text-base ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
          {lead}
        </p>
      )}
    </Reveal>
  );
}
