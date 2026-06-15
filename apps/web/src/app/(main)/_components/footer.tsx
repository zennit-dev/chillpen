import Link from "next/link";
import { Logo } from "@/components/ui";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/discover", label: "Discover" },
      { href: "/leaderboards", label: "Leaderboards" },
      { href: "/challenges", label: "Challenges" },
    ],
  },
  {
    title: "Create",
    links: [
      { href: "/write", label: "Writer Studio" },
      { href: "/me/avatar", label: "Avatar Studio" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/me", label: "Dashboard" },
      { href: "/me/saved", label: "Saved" },
      { href: "/sign-in", label: "Sign in" },
    ],
  },
] as const;

export const Footer = () => (
  <footer className="mt-24 border-white/8 border-t">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
      <div className="space-y-3">
        <Logo />
        <p className="max-w-xs font-body text-foreground-dimmed text-sm leading-relaxed">
          Build worlds together. Branch the stories you love and become the
          writer readers follow.
        </p>
      </div>
      {columns.map((column) => (
        <div key={column.title}>
          <h4 className="font-medium font-subtitle text-2xs text-foreground-dimmed uppercase tracking-widest">
            {column.title}
          </h4>
          <ul className="mt-4 space-y-2.5">
            {column.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-foreground-rich text-sm transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-white/8 border-t">
      <p className="mx-auto max-w-7xl px-4 py-6 font-subtitle text-2xs text-foreground-dimmed sm:px-6">
        © 2032 chillpen.club — storytelling, entered the future.
      </p>
    </div>
  </footer>
);
