import { resultify } from "@zenncore/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BookmarkIcon } from "@/components/icons";
import { StoryCard, StoryCardSkeleton } from "@/components/story-card";
import { createMetadata } from "@/lib/seo";
import * as Authentication from "@/server/app/authentication";
import * as Save from "@/server/app/save";
import * as Universe from "@/server/app/universe";
import { Environment } from "@/server/utils/environment";

export const metadata = createMetadata({
  title: "Library",
  description: "Your saved and beloved universes — a personal reading shelf.",
  path: "/library",
});

export default async () => {
  const proxied = await resultify(() =>
    Authentication.getProxiedCurrentUser(Environment.SERVER),
  );
  if (!proxied.success || !proxied.data.success) redirect("/sign-in");

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="font-medium font-subtitle text-2xs text-foreground-dimmed uppercase tracking-[0.2em]">
            Library
          </p>
          <h1 className="mt-1 font-display font-semibold text-3xl text-foreground sm:text-4xl">
            Saved universes
          </h1>
          <p className="mt-2 font-body text-foreground-dimmed">
            The worlds and paths you bookmarked to return to.
          </p>
        </header>

        <Suspense fallback={<GridSkeleton />}>
          <SavedGrid />
        </Suspense>
      </div>
    </main>
  );
};

const SavedGrid = async () => {
  const ids = await resultify(() => Save.savedUniverseIds(Environment.SERVER));
  const targets = ids.success && ids.data.success ? ids.data.data : [];
  const universes = await Universe.byIds(Environment.SERVER, targets);
  const cards = universes.success ? universes.data : [];

  if (cards.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
      {cards.map((universe) => (
        <StoryCard key={universe.id} universe={universe} saved />
      ))}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 border-dashed bg-background-rich/40 px-6 py-24 text-center">
    <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      <BookmarkIcon className="size-7" />
    </span>
    <p className="mt-6 font-display text-foreground text-xl italic">
      Your library is a blank page.
    </p>
    <p className="mt-2 max-w-sm font-body text-foreground-dimmed text-sm">
      Tap the save button on any book cover and it appears here — your personal
      reading shelf.
    </p>
    <Link
      href="/discover"
      className="mt-7 rounded-[4px] bg-primary px-6 py-2.5 font-medium text-primary-foreground text-sm transition hover:bg-primary-rich"
    >
      Browse universes
    </Link>
  </div>
);

const GridSkeleton = () => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
    {Array.from({ length: 10 }).map((_value, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton grid
      <StoryCardSkeleton key={index} />
    ))}
  </div>
);
