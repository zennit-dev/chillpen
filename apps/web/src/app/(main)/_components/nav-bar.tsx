"use client";

import { cn } from "@zenncore/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  BellIcon,
  CoinIcon,
  MenuIcon,
  PenIcon,
  SearchIcon,
  UserIcon,
  XIcon,
} from "@/components/icons";
import { Logo } from "@/components/ui";

export type NavUser = {
  pseudonym: string;
  coins: number;
};

const links = [
  { href: "/discover", label: "Discover" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/challenges", label: "Challenges" },
] as const;

export const NavBar = ({ user }: NavBar.Props) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: close menu on navigation
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-white/8 border-b bg-background/85 backdrop-blur-xl"
          : "bg-gradient-to-b from-background/80 to-transparent",
      )}
    >
      <nav className="mx-auto flex h-[68px] max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-5 md:flex">
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
        <div className="flex flex-col gap-1 border-white/8 border-t px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 font-medium text-foreground-rich text-sm hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/write"
            className="rounded-md px-3 py-2 font-medium text-primary text-sm hover:bg-white/5"
          >
            Create chapter
          </Link>
        </div>
      ) : null}
    </header>
  );
};

export namespace NavBar {
  export type Props = {
    user: NavUser | null;
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
