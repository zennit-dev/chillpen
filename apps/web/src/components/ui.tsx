import { cn } from "@zenncore/utils";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Small dark-luxury presentational primitives shared across surfaces.
 * Grouped per zenn-style §19 (generic filename, related exports).
 */

export const Logo = ({ className }: Logo.Props) => (
  <Link
    href="/"
    aria-label="chillpen.club"
    className={cn("inline-flex items-center gap-2", className)}
  >
    {/* biome-ignore lint/performance/noImgElement: small static SVG brand mark — nothing to optimize, and next/image rejects raw SVGs by default */}
    <img
      src="/mark.svg"
      alt=""
      width={28}
      height={28}
      className="size-7 shrink-0"
    />
    <span className="font-display font-semibold text-foreground text-lg tracking-tight">
      chillpen<span className="text-foreground-dimmed">.club</span>
    </span>
  </Link>
);

export namespace Logo {
  export type Props = {
    className?: string;
  };
}

export const Glass = ({ children, className, ...props }: Glass.Props) => (
  <div className={cn("glass rounded-xl", className)} {...props}>
    {children}
  </div>
);

export namespace Glass {
  export type Props = ComponentProps<"div">;
}

export const Chip = ({ children, active, className }: Chip.Props) => (
  <span
    className={cn(
      "inline-flex items-center rounded-[4px] border px-2 py-0.5 font-medium font-subtitle text-2xs uppercase tracking-wider",
      active
        ? "border-primary/50 bg-background/55 text-primary backdrop-blur-sm"
        : "border-white/15 bg-background/55 text-foreground-rich backdrop-blur-sm",
      className,
    )}
  >
    {children}
  </span>
);

export namespace Chip {
  export type Props = {
    children: ReactNode;
    active?: boolean;
    className?: string;
  };
}

export const Stat = ({ icon, value, label, className }: Stat.Props) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 font-subtitle text-foreground-dimmed text-xs",
      className,
    )}
  >
    {icon}
    <span className="font-medium text-foreground/90">{value}</span>
    {label ? <span className="text-foreground-dimmed">{label}</span> : null}
  </span>
);

export namespace Stat {
  export type Props = {
    icon?: ReactNode;
    value: ReactNode;
    label?: string;
    className?: string;
  };
}

export const SectionHeader = ({
  title,
  eyebrow,
  href,
  action,
  className,
}: SectionHeader.Props) => (
  <div className={cn("flex items-end justify-between gap-4", className)}>
    <div className="min-w-0">
      {eyebrow ? (
        <p className="mb-1 font-medium font-subtitle text-[0.625rem] text-foreground-dimmed uppercase tracking-[0.18em]">
          {eyebrow}
        </p>
      ) : null}
      {href ? (
        <Link
          href={href}
          className="group inline-flex items-center gap-1.5 font-display font-medium text-foreground-rich text-lg transition-colors hover:text-foreground sm:text-xl"
        >
          {title}
          <span className="text-primary opacity-0 transition-opacity group-hover:opacity-100">
            ›
          </span>
        </Link>
      ) : (
        <h2 className="font-display font-medium text-foreground-rich text-lg sm:text-xl">
          {title}
        </h2>
      )}
    </div>
    {action}
  </div>
);

export namespace SectionHeader {
  export type Props = {
    title: string;
    eyebrow?: string;
    href?: string;
    action?: ReactNode;
    className?: string;
  };
}

const tones = {
  common: "border-white/10 bg-white/5 text-foreground-dimmed",
  rare: "border-info/40 bg-info/10 text-info",
  legendary: "border-primary/45 bg-primary/15 text-primary",
} as const;

export const RarityTag = ({ rarity, className }: RarityTag.Props) => (
  <span
    className={cn(
      "inline-flex items-center rounded-[4px] border px-2 py-0.5 font-medium font-subtitle text-2xs uppercase tracking-wider",
      tones[rarity] ?? tones.common,
      className,
    )}
  >
    {rarity}
  </span>
);

export namespace RarityTag {
  export type Props = {
    rarity: keyof typeof tones;
    className?: string;
  };
}

export const formatCount = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return `${value}`;
};
