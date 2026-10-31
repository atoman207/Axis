import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

// Calm, slow colour change on hover and a small press — no lift, no glow.
const interaction =
  "transition-[color,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ";

// Hairline outline on paper; on hover it fills with ink.
const baseClass =
  "group inline-flex items-center justify-center gap-4 rounded-full border border-sumi/30 bg-surface px-7 py-3.5 text-sm font-medium tracking-[0.1em] text-sumi " +
  interaction +
  "hover:border-sumi hover:bg-sumi hover:text-background " +
  "disabled:cursor-wait disabled:opacity-70";

// White face over photos and dark bands. The label stays dark even in the space theme
// (where --sumi becomes near-white); on hover the face clears to an outline.
const onDarkClass =
  "group inline-flex items-center justify-center gap-4 rounded-full border border-white bg-white px-7 py-3.5 text-sm font-medium tracking-[0.1em] text-[#0b1730] " +
  interaction +
  "hover:bg-white/0 hover:text-white " +
  "disabled:cursor-wait disabled:opacity-70";

/** A fine line arrow that stretches on hover. */
function Arrow() {
  return (
    <span
      aria-hidden
      className="relative inline-block h-px w-5 shrink-0 bg-current transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-8"
    >
      <span className="absolute top-1/2 right-px h-[7px] w-[7px] -translate-y-1/2 rotate-45 border-t border-r border-current" />
    </span>
  );
}

type CommonProps = {
  children: ReactNode;
  className?: string;
  tone?: "default" | "onDark";
  hideArrow?: boolean;
};

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
  onClick?: () => void;
};

type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

function shellClass(tone: CommonProps["tone"], className: string) {
  return `${tone === "onDark" ? onDarkClass : baseClass} ${className}`.trim();
}

function Label({ children, hideArrow }: { children: ReactNode; hideArrow?: boolean }) {
  return (
    <>
      <span>{children}</span>
      {!hideArrow && <Arrow />}
    </>
  );
}

/** Pill CTA used across the site — hairline outline that fills with ink on hover, with a line arrow. */
export default function SiteButton(props: LinkProps | NativeButtonProps) {
  const tone = props.tone ?? "default";
  const className = props.className ?? "";
  const hideArrow = props.hideArrow;
  const cls = shellClass(tone, className);

  if ("href" in props && typeof props.href === "string") {
    const { href, external, children, onClick } = props;
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>
          <Label hideArrow={hideArrow}>{children}</Label>
        </a>
      );
    }
    return (
      <Link href={href} className={cls} onClick={onClick}>
        <Label hideArrow={hideArrow}>{children}</Label>
      </Link>
    );
  }

  const buttonProps = props as NativeButtonProps;
  const { children, type = "button", ...rest } = buttonProps;
  const { tone: _tone, hideArrow: _hide, className: _cls, ...domProps } = rest;

  return (
    <button type={type} {...domProps} className={cls}>
      <Label hideArrow={hideArrow}>{children}</Label>
    </button>
  );
}
