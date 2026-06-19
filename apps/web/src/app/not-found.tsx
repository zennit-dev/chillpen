import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { Logo } from "@/components/ui";

export const metadata = {
  title: "Lost in the universe",
  robots: { index: false, follow: false },
};

export default () => (
  <main className="relative flex min-h-screen flex-col overflow-hidden bg-background-dimmed px-6 py-8">
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-background-dimmed via-background to-background-dimmed" />
      <div className="absolute top-[-25%] left-1/2 size-[760px] -translate-x-1/2 rounded-full bg-primary/12 blur-[160px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.78))]" />
    </div>

    <Logo className="text-2xl" />

    <div className="flex flex-1 flex-col items-start justify-center gap-5 sm:max-w-xl">
      <p className="font-subtitle text-2xs text-primary uppercase tracking-[0.25em]">
        Error 404
      </p>
      <h1 className="font-display font-semibold text-5xl text-foreground leading-[1.05] sm:text-7xl">
        Lost in the universe?
      </h1>
      <p className="font-body text-base text-foreground-dimmed sm:text-lg">
        That page wandered down a branch that doesn't exist. No matter — there
        are countless living worlds waiting back home.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-[4px] bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:bg-primary-rich"
      >
        Back home
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>

    <p className="font-subtitle text-2xs text-foreground-dimmed/60 uppercase tracking-[0.2em]">
      chillpen.club — where stories never end
    </p>
  </main>
);
