import { cn } from "@zenncore/utils";
import type { ComponentProps, ReactNode } from "react";

/**
 * App-local icons the @zenncore/icons set lacks, named `[Name]Icon` for
 * consistency. @zenncore/icons exports are re-exported below so call sites have
 * a single import source.
 */

export type IconProps = ComponentProps<"svg">;

const Glyph = ({
  children,
  className,
  ...props
}: IconProps & { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("size-5 shrink-0", className)}
    aria-hidden
    {...props}
  >
    {children}
  </svg>
);

export const PlayIcon = ({ className, ...props }: IconProps) => (
  <Glyph className={cn("fill-current", className)} stroke="none" {...props}>
    <path d="M7 4.5v15l12-7.5z" />
  </Glyph>
);

export const HeartIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M12 20s-7-4.35-9.5-8.5C1 8.5 2.5 5.5 5.8 5.5c2 0 3.3 1.2 4.2 2.5.9-1.3 2.2-2.5 4.2-2.5 3.3 0 4.8 3 3.3 6C19 15.65 12 20 12 20z" />
  </Glyph>
);

export const BookmarkIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z" />
  </Glyph>
);

export const StarIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M12 3.5l2.6 5.3 5.9.86-4.27 4.16 1 5.88L12 17.9l-5.27 2.77 1-5.88L3.46 9.66l5.9-.86z" />
  </Glyph>
);

export const SearchIcon = (props: IconProps) => (
  <Glyph {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Glyph>
);

export const BellIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Glyph>
);

export const UserIcon = (props: IconProps) => (
  <Glyph {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
  </Glyph>
);

export const FireIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M12 3c2 3 .5 5 2 7 1-1 1.5-2 1.5-3.5C18 8 19 11 19 14a7 7 0 0 1-14 0c0-3 2-5 3.5-7C9 8.5 9.5 6 12 3z" />
  </Glyph>
);

export const TrophyIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
    <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" />
    <path d="M12 13v4M9 20h6M10 20v-3h4v3" />
  </Glyph>
);

export const SparkleIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
  </Glyph>
);

export const BranchIcon = (props: IconProps) => (
  <Glyph {...props}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="8" r="2.5" />
    <path d="M6 8.5v7M6 12h6a3 3 0 0 0 3-3v-.5" />
  </Glyph>
);

export const CoinIcon = (props: IconProps) => (
  <Glyph {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v10M9.5 9.5h3.2a1.8 1.8 0 0 1 0 3.6H9.5h3.5a1.8 1.8 0 0 1 0 3.6H9.5" />
  </Glyph>
);

export const CompassIcon = (props: IconProps) => (
  <Glyph {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15.5 8.5l-2 5-5 2 2-5z" />
  </Glyph>
);

export const MapIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
    <path d="M9 4v14M15 6v14" />
  </Glyph>
);

export const PenIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M14 5l5 5M4 20l1-4L16 5l3 3L8 19z" />
  </Glyph>
);

export const ShareIcon = (props: IconProps) => (
  <Glyph {...props}>
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="19" r="2.5" />
    <path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6" />
  </Glyph>
);

export const BoltIcon = ({ className, ...props }: IconProps) => (
  <Glyph className={cn("fill-current", className)} stroke="none" {...props}>
    <path d="M13 2 4.5 13.2c-.3.4 0 .9.5.9H11l-1 8 8.5-11.2c.3-.4 0-.9-.5-.9H12z" />
  </Glyph>
);

export const GhostIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M5 21v-9a7 7 0 0 1 14 0v9l-2.3-1.8-2.3 1.8-2.1-1.8L10 21l-2.3-1.8z" />
    <path d="M9.5 10h.01M14.5 10h.01" />
  </Glyph>
);

export const XLogoIcon = ({ className, ...props }: IconProps) => (
  <Glyph className={cn("fill-current", className)} stroke="none" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.967 6.817H1.683l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </Glyph>
);

export const InstagramIcon = (props: IconProps) => (
  <Glyph {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17 6.5h.01" />
  </Glyph>
);

export const SlidersIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h6M14 17h6" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="12" r="2" />
    <circle cx="12" cy="17" r="2" />
  </Glyph>
);

export const HelpIcon = (props: IconProps) => (
  <Glyph {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.6 9.5a2.5 2.5 0 0 1 4.7 1.1c0 1.7-2.3 1.9-2.3 3.4" />
    <path d="M12 17h.01" />
  </Glyph>
);

export const LogoutIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M9 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3" />
    <path d="M14 8l4 4-4 4M18 12H9" />
  </Glyph>
);

export {
  ArrowRightIcon,
  CheckBadgeIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  PlusIcon,
  XIcon,
} from "@zenncore/icons";
