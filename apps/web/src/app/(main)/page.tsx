import { resultify } from "@zenncore/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Carousel } from "@/components/carousel";
import { HeroSlider } from "@/components/hero-slider";
import { TrophyIcon } from "@/components/icons";
import { StoryCard, StoryCardSkeleton } from "@/components/story-card";
import { formatCount, SectionHeader } from "@/components/ui";
import * as Leaderboard from "@/server/app/leaderboard";
import * as ReadPath from "@/server/app/read-path";
import * as Universe from "@/server/app/universe";
import { Environment } from "@/server/utils/environment";

export default () => (
  <main>
    <Suspense fallback={<HeroSkeleton />}>
      <HeroSection />
    </Suspense>

    <div className="relative z-10 -mt-20 space-y-10 pb-10">
      <Suspense fallback={null}>
        <ContinueShelf />
      </Suspense>
      <Suspense fallback={<ShelfSkeleton title="Trending Now" />}>
        <BrowseShelf
          title="Trending Now"
          href="/discover"
          load={() => Universe.trending(Environment.SERVER, { size: 14 })}
        />
      </Suspense>
      <Suspense fallback={<ShelfSkeleton title="New This Week" />}>
        <BrowseShelf
          title="New This Week"
          href="/discover"
          load={() => Universe.newThisWeek(Environment.SERVER, { size: 14 })}
        />
      </Suspense>
      <Suspense fallback={<ShelfSkeleton title="Most Forked Universes" />}>
        <BrowseShelf
          title="Most Forked Universes"
          href="/discover"
          load={() => Universe.mostForked(Environment.SERVER, { size: 14 })}
        />
      </Suspense>
      <Suspense fallback={null}>
        <RisingWritersShelf />
      </Suspense>
      <Suspense fallback={<ShelfSkeleton title="Most Completed" />}>
        <BrowseShelf
          title="Most Completed"
          href="/discover"
          load={() => Universe.mostCompleted(Environment.SERVER, { size: 14 })}
        />
      </Suspense>
      <Suspense fallback={<ShelfSkeleton title="Recommended For You" />}>
        <BrowseShelf
          title="Recommended For You"
          href="/discover"
          load={() => Universe.recommended(Environment.SERVER, { size: 14 })}
        />
      </Suspense>
    </div>
  </main>
);

const HeroSection = async () => {
  const featured = await Universe.listFeatured(Environment.SERVER);
  if (!featured.success || featured.data.length === 0) return <HeroEmpty />;

  const slides = featured.data.map((universe) => ({
    slug: universe.slug,
    title: universe.title,
    hook: universe.featuredHook ?? universe.description ?? "",
    cover:
      universe.cover ?? `https://picsum.photos/seed/${universe.slug}/1280/720`,
    genre: universe.genreNames[0] ?? "Story",
    readCount: universe.readCount,
    forkCount: universe.forkCount,
    rating: universe.rating,
  }));

  return <HeroSlider slides={slides} />;
};

type ShelfLoader = () => Promise<Awaited<ReturnType<typeof Universe.trending>>>;

const BrowseShelf = async ({
  title,
  href,
  load,
}: {
  title: string;
  href: string;
  load: ShelfLoader;
}) => {
  const result = await load();
  if (!result.success || result.data.length === 0) return null;
  return <Shelf title={title} href={href} cards={result.data} />;
};

const ContinueShelf = async () => {
  const result = await resultify(() => ReadPath.resume(Environment.SERVER));
  if (!result.success || !result.data.success) return null;

  const cards = result.data.data.flatMap((entry) =>
    entry.universe ? [{ ...entry.universe, author: null, genreNames: [] }] : [],
  );
  if (cards.length === 0) return null;
  return <Shelf title="Continue Reading" cards={cards} />;
};

const RisingWritersShelf = async () => {
  const result = await Leaderboard.risingWriters(Environment.SERVER, {
    size: 10,
  });
  if (!result.success || result.data.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHeader
        title="Rising Writers"
        href="/leaderboards"
        className="mb-3"
      />
      <Carousel>
        {result.data.map((writer) => (
          <Link
            key={writer.user}
            href={`/u/${writer.pseudonym}`}
            className="group/writer flex w-[200px] shrink-0 snap-start flex-col gap-3 rounded-[5px] border border-white/8 bg-background-rich p-4 transition hover:border-primary/30"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 font-display font-semibold text-lg text-primary">
              {writer.pseudonym.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="font-display font-medium text-foreground text-sm">
                {writer.pseudonym}
              </p>
              <p className="mt-0.5 flex items-center gap-1 font-subtitle text-2xs text-foreground-dimmed">
                <TrophyIcon className="size-3 text-primary" />#{writer.rank} ·{" "}
                {formatCount(writer.score)} pts
              </p>
            </div>
          </Link>
        ))}
      </Carousel>
    </section>
  );
};

const Shelf = ({
  title,
  href,
  cards,
}: {
  title: string;
  href?: string;
  cards: Universe.Card[];
}) => (
  <section className="mx-auto max-w-7xl px-4 sm:px-6">
    <SectionHeader title={title} href={href} className="mb-3" />
    <Carousel>
      {cards.map((card) => (
        <StoryCard
          key={card.id}
          universe={card}
          className="w-[240px] shrink-0 snap-start sm:w-[260px]"
        />
      ))}
    </Carousel>
  </section>
);

const HeroEmpty = () => (
  <section className="flex h-[70vh] min-h-[460px] flex-col items-center justify-center bg-gradient-to-b from-background-rich to-background px-6 text-center">
    <p className="font-subtitle text-2xs text-primary uppercase tracking-[0.2em]">
      chillpen.club
    </p>
    <h1 className="mt-4 max-w-2xl font-display font-semibold text-4xl text-foreground leading-tight sm:text-6xl">
      Build worlds together
    </h1>
    <p className="mt-4 max-w-md font-body text-foreground-rich">
      Seed the database to fill the catalog with living, branching universes.
    </p>
    <Link
      href="/write"
      className="mt-8 rounded-[4px] bg-primary px-6 py-2.5 font-medium text-primary-foreground text-sm transition hover:bg-primary-rich"
    >
      Start a universe
    </Link>
  </section>
);

const HeroSkeleton = () => (
  <div className="h-[78vh] min-h-[520px] w-full animate-pulse bg-gradient-to-b from-background-rich to-background" />
);

const ShelfSkeleton = ({ title }: { title: string }) => (
  <section className="mx-auto max-w-7xl px-4 sm:px-6">
    <SectionHeader title={title} className="mb-3" />
    <div className="-mx-4 flex gap-3 overflow-hidden px-4 sm:-mx-6 sm:px-6">
      {Array.from({ length: 8 }).map((_value, index) => (
        <StoryCardSkeleton
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton row
          key={index}
          className="w-[240px] shrink-0 sm:w-[260px]"
        />
      ))}
    </div>
  </section>
);
