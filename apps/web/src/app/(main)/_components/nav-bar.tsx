"use client";

import { cn } from "@zenncore/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIcon,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPopup,
  NavigationMenuPositioner,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@zenncore/web/components/navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  BellIcon,
  BoltIcon,
  CoinIcon,
  CompassIcon,
  FireIcon,
  GhostIcon,
  HeartIcon,
  type IconProps,
  MenuIcon,
  PenIcon,
  SearchIcon,
  SparkleIcon,
  StarIcon,
  UserIcon,
  XIcon,
} from "@/components/icons";
import { Logo } from "@/components/ui";

export type NavUser = {
  pseudonym: string;
  coins: number;
};

export type NavGenre = {
  slug: string;
  name: string;
  accent: string | null;
};

const links = [
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/challenges", label: "Challenges" },
] as const;

type GenreMeta = {
  icon: (props: IconProps) => ReactNode;
  description: string;
};

const genreMeta: Record<string, GenreMeta> = {
  "sci-fi": { icon: SparkleIcon, description: "Futures, machines, and the edge of possibility" },
  fantasy: { icon: StarIcon, description: "Magic, myth, and worlds unbound" },
  horror: { icon: GhostIcon, description: "Dread that follows you home" },
  romance: { icon: HeartIcon, description: "Hearts on the line" },
  mystery: { icon: CompassIcon, description: "Clues, twists, and the truth beneath" },
  cyberpunk: { icon: BoltIcon, description: "Neon, rain, and machine dreams" },
  thriller: { icon: FireIcon, description: "Pulse-pounding, page-turning tension" },
  literary: { icon: PenIcon, description: "Quiet, human, beautifully written" },
};

const fallbackMeta: GenreMeta = {
  icon: SparkleIcon,
  description: "Living, branching stories",
};

export const NavBar = ({ user, genres = [] }: NavBar.Props) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: close mobile menu on navigation
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-white/8 border-b bg-background/72 backdrop-blur-xl">
      <nav className="mx-auto flex h-[68px] max-w-7xl items-center gap-5 px-4 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-4 md:flex">
          <NavigationMenu className="bg-transparent p-0 text-foreground">
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center gap-1 rounded-md bg-transparent px-2 py-1.5 font-medium font-subtitle text-foreground-dimmed text-sm transition hover:text-foreground data-popup-open:text-foreground">
                  Discover
                  <NavigationMenuIcon
                    classList={{ icon: "size-3.5 stroke-current" }}
                  />
                </NavigationMenuTrigger>
                <NavigationMenuContent className="p-0">
                  <div className="grid w-[560px] grid-cols-2 gap-1 p-2.5">
                    {genres.map((genre) => {
                      const meta = genreMeta[genre.slug] ?? fallbackMeta;
                      const Icon = meta.icon;
                      const accent = genre.accent ?? "#e8b45a";
                      return (
                        <NavigationMenuLink
                          key={genre.slug}
                          render={<Link href={`/discover?genre=${genre.slug}`} />}
                          className="flex items-start gap-3 rounded-lg p-3 no-underline transition hover:bg-white/5"
                        >
                          <span
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor: `${accent}1f`,
                              color: accent,
                            }}
                          >
                            <Icon className="size-[18px]" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-display font-medium text-foreground text-sm">
                              {genre.name}
                            </span>
                            <span className="block font-body text-foreground-dimmed text-xs leading-snug">
                              {meta.description}
                            </span>
                          </span>
                        </NavigationMenuLink>
                      );
                    })}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuPositioner sideOffset={16} align="start">
              <NavigationMenuPopup className="rounded-xl border border-white/10 bg-background-rich text-foreground shadow-[0_28px_80px_-20px_rgba(0,0,0,0.85)] outline-0">
                <NavigationMenuViewport />
              </NavigationMenuPopup>
            </NavigationMenuPositioner>
          </NavigationMenu>

          {links.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              active={pathname.startsWith(link.href)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <IconLink href="/search" label="Search">
            <SearchIcon className="size-5" />
          </IconLink>
          <Link
            href="/write"
            className="hidden items-center gap-1.5 rounded-[4px] bg-primary px-3.5 py-2 font-medium text-primary-foreground text-sm transition hover:bg-primary-rich sm:inline-flex"
          >
            <PenIcon className="size-4" />
            Create
          </Link>
          {user ? (
            <>
              <IconLink href="/me" label="Notifications">
                <BellIcon className="size-5" />
              </IconLink>
              <Link
                href="/me"
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-1 pr-3 pl-1 transition hover:border-primary/30"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <UserIcon className="size-4" />
                </span>
                <span className="inline-flex items-center gap-1 font-medium font-subtitle text-primary text-xs">
                  <CoinIcon className="size-3.5" />
                  {user.coins}
                </span>
              </Link>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-[4px] border border-white/12 bg-white/5 px-3.5 py-2 font-medium text-foreground text-sm transition hover:border-primary/40"
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((current) => !current)}
            className="flex size-9 items-center justify-center rounded-full text-foreground md:hidden"
          >
            {open ? (
              <XIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="max-h-[70vh] space-y-4 overflow-y-auto border-white/8 border-t bg-background-rich px-4 py-4 md:hidden">
          <Link
            href="/discover"
            className="block font-medium text-foreground-rich text-sm"
          >
            Discover
          </Link>
          <div className="grid grid-cols-2 gap-1.5">
            {genres.map((genre) => {
              const meta = genreMeta[genre.slug] ?? fallbackMeta;
              const Icon = meta.icon;
              const accent = genre.accent ?? "#e8b45a";
              return (
                <Link
                  key={genre.slug}
                  href={`/discover?genre=${genre.slug}`}
                  className="flex items-center gap-2 rounded-lg border border-white/8 px-2.5 py-2"
                >
                  <span style={{ color: accent }}>
                    <Icon className="size-4" />
                  </span>
                  <span className="font-medium text-foreground text-xs">
                    {genre.name}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="flex flex-col gap-1 border-white/8 border-t pt-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-1 py-1.5 font-medium text-foreground-rich text-sm"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/write"
              className="rounded-md px-1 py-1.5 font-medium text-primary text-sm"
            >
              Create chapter
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export namespace NavBar {
  export type Props = {
    user: NavUser | null;
    genres: NavGenre[];
  };
}

const NavLink = ({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) => (
  <Link
    href={href}
    className={cn(
      "font-medium font-subtitle text-sm transition-colors",
      active
        ? "text-foreground"
        : "text-foreground-dimmed hover:text-foreground",
    )}
  >
    {children}
  </Link>
);

const IconLink = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) => (
  <Link
    href={href}
    aria-label={label}
    className="flex size-9 items-center justify-center rounded-full text-foreground-dimmed transition hover:bg-white/5 hover:text-foreground"
  >
    {children}
  </Link>
);
