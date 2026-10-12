import Image from "next/image";
import { COMPANY } from "@/lib/company";

type Props = {
  /** `onDark` keeps the wording white, for the footer. */
  tone?: "default" | "onDark";
  eager?: boolean;
};

/** Logo mark with the company name set beside it. */
export default function SiteLogo({ tone = "default", eager = false }: Props) {
  const onDark = tone === "onDark";

  return (
    <span className="flex items-center gap-3">
      {/* the mark is drawn on its own dark ground, so it sits in a tile of the same colour */}
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#00040e] ring-1 ring-white/10 sm:h-11 sm:w-11">
        <Image
          src={COMPANY.logo}
          alt={COMPANY.brand}
          width={48}
          height={48}
          className="h-full w-full object-contain"
          loading={eager ? "eager" : "lazy"}
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`text-[15px] font-bold tracking-[0.06em] sm:text-base ${onDark ? "text-white" : "text-sumi"}`}>
          {COMPANY.name}
        </span>
        <span
          className={`mt-1.5 hidden text-[9px] font-medium tracking-[0.24em] min-[420px]:block ${
            onDark ? "text-white/50" : "text-faint"
          }`}
        >
          FULL-STACK AI ENGINEERING
        </span>
      </span>
    </span>
  );
}
