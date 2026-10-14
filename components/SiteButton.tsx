import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const baseClass =
  "group inline-flex items-center justify-center gap-1.5 rounded-full border bg-surface px-6 py-3 text-sm font-semibold text-sumi shadow-sm transition-colors duration-300 " +
  "border-line-strong hover:border-yellow-400 hover:text-yellow-600 " +
  "disabled:cursor-wait disabled:opacity-70";

const onDarkClass =
  "group inline-flex items-center justify-center gap-1.5 rounded-full border border-white/45 bg-white px-6 py-3 text-sm font-semibold text-sumi shadow-sm transition-colors duration-300 " +
  "hover:border-yellow-400 hover:text-yellow-600 " +
  "disabled:cursor-wait disabled:opacity-70";

function Arrow() {
  return (
    <span
      aria-hidden
      className="inline-flex w-[1em] shrink-0 justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    >
      →
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
      <span className="inline-block origin-center transition-transform duration-300 group-hover:scale-110">
        {children}
      </span>
      {!hideArrow && <Arrow />}
    </>
  );
}

/** Pill CTA used across the site — white face, border, hover grows text only and reveals → */
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
