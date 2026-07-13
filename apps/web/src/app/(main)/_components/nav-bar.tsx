"use client";

import { cn } from "@zenncore/utils";
import { useAsyncAction } from "@zenncore/utils/hooks";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/avatar";
import {
  BellIcon,
  BoltIcon,
  BookmarkIcon,
  ChevronDownIcon,
  CoinIcon,
  CompassIcon,
  FireIcon,
  GhostIcon,
  HeartIcon,
  HelpIcon,
  type IconProps,
  LogoutIcon,
  MenuIcon,
  PenIcon,
  SearchIcon,
  SlidersIcon,
  SparkleIcon,
  StarIcon,
  UserIcon,
  XIcon,
} from "@/components/icons";
import { Logo } from "@/components/ui";
import * as Authentication from "@/server/app/authentication";

export type NavUser = {
  pseudonym: string;
  coins: number;
  avatar?: string | null;
  image?: string | null;
  isAdmin?: boolean;
};

export type NavGenre = {
  slug: string;
  name: string;
  accent: string | null;
};

const links = [
  { href: "/discover", label: "Discover" },
  { href: "/library", label: "Library" },
  { href: "/write", label: "Writer Studio" },
  { href: "/leaderboards", label: "Leaderboard" },
] as const;

type GenreMeta = {
  icon: (props: IconProps) => ReactNode;
  description: string;
};

const genreMeta: Record<string, GenreMeta> = {
  "sci-fi": {
    icon: SparkleIcon,
    description: "Futures, machines, and the edge of possibility",
  },
  fantasy: { icon: StarIcon, description: "Magic, myth, and worlds unbound" },
  thriller: {
    icon: FireIcon,
    description: "Pulse-pounding, page-turning tension",
  },
  horror: { icon: GhostIcon, description: "Dread that follows you home" },
  romance: { icon: HeartIcon, description: "Hearts on the line" },
  mystery: {
    icon: CompassIcon,
    description: "Clues, twists, and the truth beneath",
  },
  historical: {
    icon: BookmarkIcon,
    description: "The past, vividly reimagined",
  },
  literary: { icon: PenIcon, description: "Quiet, human, beautifully written" },
  satire: { icon: BoltIcon, description: "Sharp, funny, and unafraid" },
  drama: { icon: HeartIcon, description: "High stakes, deep feeling" },
  cyberpunk: { icon: BoltIcon, description: "Neon, rain, and machine dreams" },
};

// Canonical browse order — used as a fallback when the catalog has no genres
// loaded yet (e.g. servers asleep in preview).
const fallbackGenres: NavGenre[] = [
  { slug: "sci-fi", name: "Sci-Fi", accent: "#60a5fa" },
  { slug: "fantasy", name: "Fantasy", accent: "#a855f7" },
  { slug: "thriller", name: "Thriller", accent: "#f97316" },
  { slug: "horror", name: "Horror", accent: "#ef4444" },
  { slug: "romance", name: "Romance", accent: "#ec4899" },
  { slug: "mystery", name: "Mystery", accent: "#22d3ee" },
  { slug: "historical", name: "Historical", accent: "#d4a373" },
  { slug: "literary", name: "Literary", accent: "#94a3b8" },
  { slug: "satire", name: "Satire", accent: "#e8b45a" },
  { slug: "drama", name: "Drama", accent: "#f472b6" },
];

const fallbackMeta: GenreMeta = {
  icon: SparkleIcon,
  description: "Living, branching stories",
};

export const NavBar = ({ user, genres = [] }: NavBar.Props) => {
  const [open, setOpen] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);
  const pathname = usePathname();
  const browseGenres = genres.length > 0 ? genres : fallbackGenres;
  const navLinks = user?.isAdmin
    ? [...links, { href: "/admin" as const, label: "Admin" }]
    : links;

  // biome-ignore lint/correctness/useExhaustiveDependencies: close menus on navigation
  useEffect(() => {
    setOpen(false);
    setGenresOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-white/8 border-b bg-background/72 backdrop-blur-xl">
      <nav className="mx-auto flex h-[68px] max-w-7xl items-center gap-5 px-4 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              active={
                link.href === "/discover"
                  ? pathname === "/discover"
                  : pathname.startsWith(link.href)
              }
              highlight={link.href === "/admin"}
            >
              {link.label}
            </NavLink>
          ))}

          <div className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={genresOpen}
              onClick={() => setGenresOpen((current) => !current)}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1.5 font-medium font-subtitle text-sm transition-colors",
                genresOpen
                  ? "text-foreground"
                  : "text-foreground-dimmed hover:text-foreground",
              )}
            >
              Genres
              <ChevronDownIcon
                className={cn(
                  "size-3.5 transition-transform",
                  genresOpen && "rotate-180",
                )}
              />
            </button>
            {genresOpen ? (
              <>
                <button
                  type="button"
                  aria-label="Close"
                  tabIndex={-1}
                  onClick={() => setGenresOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
                <div className="absolute top-full left-0 z-50 mt-3 w-[560px] rounded-xl border border-white/10 bg-background-rich p-2.5 shadow-[0_28px_80px_-20px_rgba(0,0,0,0.85)]">
                  <Link
                    href="/discover"
                    className="mb-1 flex items-center gap-3 rounded-lg p-3 no-underline transition hover:bg-white/5"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <CompassIcon className="size-[18px]" />
                    </span>
                    <span>
                      <span className="block font-display font-medium text-foreground text-sm">
                        All universes
                      </span>
                      <span className="block font-body text-foreground-dimmed text-xs">
                        Every living world on chillpen
                      </span>
                    </span>
                  </Link>
                  <div className="grid grid-cols-2 gap-1">
                    {browseGenres.map((genre) => {
                      const meta = genreMeta[genre.slug] ?? fallbackMeta;
                      const Icon = meta.icon;
                      const accent = genre.accent ?? "#e8b45a";
                      return (
                        <Link
                          key={genre.slug}
                          href={`/discover?genre=${genre.slug}`}
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
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <IconLink href="/search" label="Search">
            <SearchIcon className="size-5" />
          </IconLink>
          {user ? (
            <>
              <IconLink href="/me" label="Notifications">
                <BellIcon className="size-5" />
              </IconLink>
              <AccountMenu user={user} />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden rounded-[4px] px-3 py-2 font-medium text-foreground-dimmed text-sm transition hover:text-foreground sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-[4px] bg-foreground px-3.5 py-2 font-medium text-background text-sm transition hover:bg-foreground/90"
              >
                Get started
              </Link>
            </>
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
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-1 py-1.5 font-medium text-sm",
                  link.href === "/admin"
                    ? "text-primary"
                    : "text-foreground-rich",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-white/8 border-t pt-3">
            <p className="mb-2 font-medium font-subtitle text-2xs text-foreground-dimmed uppercase tracking-widest">
              Genres
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {browseGenres.map((genre) => {
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

const accountLinks = [
  { href: "/me", label: "Dashboard", icon: UserIcon },
  { href: "/library", label: "Library", icon: BookmarkIcon },
  { href: "/me/avatar", label: "Avatar studio", icon: SparkleIcon },
  { href: "/me/settings", label: "Account settings", icon: SlidersIcon },
  { href: "/help", label: "Help", icon: HelpIcon },
] as const;

const adminLink = {
  href: "/admin",
  label: "Admin",
  icon: SlidersIcon,
} as const;

const AccountMenu = ({ user }: { user: NavUser }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [logout, isLoggingOut] = useAsyncAction(async () => {
    await Authentication.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  });

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-1 pr-2.5 pl-1 transition hover:border-primary/30"
      >
        <Avatar
          preset={user.avatar}
          image={user.image}
          name={user.pseudonym}
          className="size-7"
        />
        <span className="inline-flex items-center gap-1 font-medium font-subtitle text-primary text-xs">
          <CoinIcon className="size-3.5" />
          {user.coins}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-3.5 text-foreground-dimmed transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute top-full right-0 z-50 mt-3 w-60 rounded-xl border border-white/10 bg-background-rich p-2 shadow-[0_28px_80px_-20px_rgba(0,0,0,0.85)]">
            <div className="flex items-center gap-3 rounded-lg p-2.5">
              <Avatar
                preset={user.avatar}
                image={user.image}
                name={user.pseudonym}
                className="size-9"
              />
              <div className="min-w-0">
                <p className="truncate font-display font-medium text-foreground text-sm">
                  {user.pseudonym}
                </p>
                <p className="inline-flex items-center gap-1 font-subtitle text-primary text-xs">
                  <CoinIcon className="size-3" />
                  {user.coins} coins
                </p>
              </div>
            </div>
            <div className="my-1.5 h-px bg-white/8" />
            <div className="flex flex-col">
              {user.isAdmin ? (
                <Link
                  href={adminLink.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg bg-primary/10 px-2.5 py-2 font-subtitle text-primary text-sm no-underline transition hover:bg-primary/15"
                >
                  <adminLink.icon className="size-4" />
                  {adminLink.label}
                </Link>
              ) : null}
              {accountLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-subtitle text-foreground-rich text-sm no-underline transition hover:bg-white/5"
                  >
                    <Icon className="size-4 text-foreground-dimmed" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="my-1.5 h-px bg-white/8" />
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() => void logout()}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left font-subtitle text-foreground-rich text-sm transition hover:bg-white/5 disabled:opacity-60"
            >
              <LogoutIcon className="size-4 text-foreground-dimmed" />
              {isLoggingOut ? "Signing out…" : "Log out"}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};

const NavLink = ({
  href,
  active,
  highlight,
  children,
}: {
  href: string;
  active: boolean;
  highlight?: boolean;
  children: ReactNode;
}) => (
  <Link
    href={href}
    className={cn(
      "rounded-md px-2.5 py-1.5 font-medium font-subtitle text-sm transition-colors",
      highlight
        ? "bg-primary/15 text-primary"
        : active
          ? "bg-white/5 text-foreground"
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
