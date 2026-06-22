import { resultify } from "@zenncore/utils";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRightIcon,
  BranchIcon,
  CoinIcon,
  PlayIcon,
  SparkleIcon,
} from "@/components/icons";
import { Motion } from "@/components/motion";
import * as Authentication from "@/server/app/authentication";
import { Environment } from "@/server/utils/environment";

// The cinematic front door for new visitors. Signed-in members skip straight to
// the live catalog on /discover (no confusing public CTAs once you're in).
export default async () => {
  const proxied = await resultify(() =>
    Authentication.getProxiedCurrentUser(Environment.SERVER),
  );
  if (proxied.success && proxied.data.success) redirect("/discover");

  return (
    <main>
      <Hero />
      <HowItWorks />
    </main>
  );
};

const Hero = () => (
  <section className="relative flex h-[100svh] min-h-[640px] flex-col justify-end overflow-hidden">
    <Image
      src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80"
      alt=""
      fill
      priority
      sizes="100vw"
      className="object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
    <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent" />
    <div className="absolute top-[-20%] left-1/2 size-[680px] -translate-x-1/2 rounded-full bg-primary/10 blur-[180px]" />

    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:pb-28">
      <Motion.Up className="max-w-2xl">
        <p className="font-medium font-subtitle text-2xs text-primary uppercase tracking-[0.3em]">
          Storytelling · 2032
        </p>
        <h1 className="mt-4 font-display font-semibold text-6xl text-foreground leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl">
          Build worlds
          <br />
          <span className="font-reading text-primary italic">together.</span>
        </h1>
        <p className="mt-6 max-w-md font-body text-base text-foreground-rich leading-relaxed sm:text-lg">
          One author writes the first chapter. The world keeps writing the next
          — branching universes, infinite continuations, every reader picks
          their path.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-[4px] bg-foreground px-7 py-3 font-medium text-background text-sm transition hover:bg-foreground/90"
          >
            <PlayIcon className="size-4" />
            Start 30-day trial
          </Link>
          <Link
            href="/discover"
            className="glass inline-flex items-center gap-2 rounded-[4px] px-6 py-3 font-medium text-foreground text-sm transition hover:border-primary/40"
          >
            Explore worlds
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
        <p className="mt-4 font-subtitle text-2xs text-foreground-dimmed">
          €8/month after the trial · Writing is always free
        </p>
      </Motion.Up>
    </div>
  </section>
);

const features = [
  {
    icon: BranchIcon,
    title: "Branching narratives",
    body: "Every chapter becomes a fork. Multiple writers continue the story — readers choose which path to live in.",
  },
  {
    icon: SparkleIcon,
    title: "AI consistency engine",
    body: "Claude-powered checks keep characters, lore, and continuity in line — without flattening your voice.",
  },
  {
    icon: CoinIcon,
    title: "Coin economy",
    body: "Earn for publishing, getting read, and being chosen. Unlock animated frames, rare cosmetics, and reputation.",
  },
] as const;

const HowItWorks = () => (
  <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
    <Motion.Up className="mx-auto max-w-xl text-center">
      <p className="font-medium font-subtitle text-2xs text-primary uppercase tracking-[0.3em]">
        How it works
      </p>
      <h2 className="mt-3 font-display font-semibold text-3xl text-foreground sm:text-4xl">
        A living library that writes itself
      </h2>
      <p className="mt-3 font-body text-foreground-dimmed">
        Readers choose paths. Writers continue universes. AI keeps the canon
        honest. Coins reward the storytellers worth following.
      </p>
    </Motion.Up>

    <Motion.Stagger className="mt-14 grid gap-4 sm:grid-cols-3" delay={0.05}>
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <Motion.Item key={feature.title}>
            <article className="h-full rounded-2xl border border-white/8 bg-background-rich p-6 transition hover:border-primary/25">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display font-medium text-foreground text-lg">
                {feature.title}
              </h3>
              <p className="mt-2 font-body text-foreground-dimmed text-sm leading-relaxed">
                {feature.body}
              </p>
            </article>
          </Motion.Item>
        );
      })}
    </Motion.Stagger>

    <Motion.Fade className="mt-16" delay={0.1}>
      <figure className="mx-auto max-w-2xl rounded-2xl border border-white/8 bg-gradient-to-br from-primary/[0.06] to-transparent px-8 py-12 text-center">
        <blockquote className="font-reading text-2xl text-foreground italic leading-snug sm:text-3xl">
          "Your story changed because{" "}
          <span className="text-primary">LunaInk</span> added Chapter 12."
        </blockquote>
        <figcaption className="mt-4 font-medium font-subtitle text-2xs text-foreground-dimmed uppercase tracking-[0.2em]">
          A real chapter notification
        </figcaption>
      </figure>
    </Motion.Fade>

    <Motion.Up className="mt-16 text-center" delay={0.05}>
      <Link
        href="/sign-up"
        className="inline-flex items-center gap-2 rounded-[4px] bg-primary px-7 py-3 font-medium text-primary-foreground text-sm transition hover:bg-primary-rich"
      >
        Claim your pseudonym
        <ArrowRightIcon className="size-4" />
      </Link>
    </Motion.Up>
  </section>
);
