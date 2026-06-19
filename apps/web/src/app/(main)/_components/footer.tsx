import Link from "next/link";
import { InstagramIcon, XLogoIcon } from "@/components/icons";
import { Logo } from "@/components/ui";
import { seo } from "@/lib/seo";

const socials = [
  { href: seo.links[0], label: "chillpen on X", icon: XLogoIcon },
  { href: seo.links[1], label: "chillpen on Instagram", icon: InstagramIcon },
] as const;

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
      <div className="space-y-4">
        <Logo />
        <p className="max-w-xs font-body text-foreground-dimmed text-sm leading-relaxed">
          Build worlds together. Branch the stories you love and become the
          writer readers follow.
        </p>
        <div className="flex items-center gap-2">
          {socials.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="flex size-9 items-center justify-center rounded-full border border-white/8 text-foreground-dimmed transition hover:border-primary/30 hover:text-foreground"
              >
                <Icon className="size-4" />
              </a>
            );
          })}
        </div>
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
                  className="font-body text-foreground-dimmed text-sm transition-colors hover:text-foreground"
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
        © 2026 chillpen.club — where stories never end.
      </p>
    </div>
  </footer>
);
