import { resultify } from "@zenncore/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Carousel } from "@/components/carousel";
import { HeroSlider } from "@/components/hero-slider";
import { TrophyIcon } from "@/components/icons";
import { StoryCard, StoryCardSkeleton } from "@/components/story-card";
import { Chip, formatCount, SectionHeader } from "@/components/ui";
import { createMetadata } from "@/lib/seo";
import * as Genre from "@/server/app/genre";
import * as Leaderboard from "@/server/app/leaderboard";
import * as ReadPath from "@/server/app/read-path";
import * as Universe from "@/server/app/universe";
import { Environment } from "@/server/utils/environment";
import { parseSearchParam } from "@/utils/search-params";

export const metadata = createMetadata({
  title: "Discover",
  description:
    "Browse living, branching universes by genre, velocity, and the writers building them.",
  path: "/discover",
});

export default async ({ searchParams }: PageProps<"/discover">) => {
  const { genre: parameter } = await searchParams;
  const genre = parseSearchParam(parameter, "single");

  // Genre selected → focused, filterable grid. Otherwise the cinematic home:
  // a full-bleed featured slideshow followed by structured shelves.
  if (genre) return <FilteredView genre={genre} />;
  return <HomeView />;
};

// ── Home (no filter): featured slider + Netflix-style shelves ─────────────────

const HomeView = () => (
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
          eyebrow="What the world is reading"
          load={() => Universe.trending(Environment.SERVER, { size: 14 })}
        />
      </Suspense>
      <Suspense fallback={<ShelfSkeleton title="New This Week" />}>
        <BrowseShelf
          title="New This Week"
          eyebrow="Just dropped"
          load={() => Universe.newThisWeek(Environment.SERVER, { size: 14 })}
        />
      </Suspense>
      <Suspense fallback={<ShelfSkeleton title="Most Forked" />}>
        <BrowseShelf
          title="Most Forked"
          eyebrow="Universes splitting open"
          load={() => Universe.mostForked(Environment.SERVER, { size: 14 })}
        />
      </Suspense>
      <Suspense fallback={<ShelfSkeleton title="Completed Universes" />}>
        <BrowseShelf
          title="Completed Universes"
          eyebrow="Read end to end"
          load={() => Universe.mostCompleted(Environment.SERVER, { size: 14 })}
        />
      </Suspense>
      <Suspense fallback={null}>
        <RisingWritersShelf />
      </Suspense>
      <Suspense fallback={<ShelfSkeleton title="Recommended For You" />}>
        <BrowseShelf
          title="Recommended For You"
          eyebrow="Curated picks"
          load={() => Universe.recommended(Environment.SERVER, { size: 14 })}
        />
      </Suspense>
    </div>

    <p className="pb-16 text-center font-display text-foreground-dimmed/70 text-lg italic">
      Build worlds together.
    </p>
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
  eyebrow,
  load,
}: {
  title: string;
  eyebrow?: string;
  load: ShelfLoader;
}) => {
  const result = await load();
  if (!result.success || result.data.length === 0) return null;
  return <Shelf title={title} eyebrow={eyebrow} cards={result.data} />;
};

const ContinueShelf = async () => {
  const result = await resultify(() => ReadPath.resume(Environment.SERVER));
  if (!result.success || !result.data.success) return null;

  const cards = result.data.data.flatMap((entry) =>
    entry.universe ? [{ ...entry.universe, author: null, genreNames: [] }] : [],
  );
  if (cards.length === 0) return null;
  return (
    <Shelf
      title="Continue Reading"
      eyebrow="Pick up where you left"
      cards={cards}
    />
  );
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
        eyebrow="Voices to watch"
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
  eyebrow,
  href,
  cards,
}: {
  title: string;
  eyebrow?: string;
  href?: string;
  cards: Universe.Card[];
}) => (
  <section className="mx-auto max-w-7xl px-4 sm:px-6">
    <SectionHeader
      title={title}
      eyebrow={eyebrow}
      href={href}
      className="mb-3"
    />
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

// ── Filtered (genre selected): focused grid ───────────────────────────────────

const FilteredView = ({ genre }: { genre: string }) => (
  <main className="px-4 pt-28 pb-20 sm:px-6">
    <div className="mx-auto max-w-7xl">
      <header className="mb-6">
        <h1 className="font-display font-semibold text-3xl text-foreground sm:text-4xl">
          Discover universes
        </h1>
        <p className="mt-2 font-body text-foreground-dimmed">
          Browse living worlds by genre, velocity, and the writers building
          them.
        </p>
      </header>

      <Suspense fallback={null}>
        <Filters active={genre} />
      </Suspense>

      <Suspense fallback={<GridSkeleton />}>
        <Grid genre={genre} />
      </Suspense>
    </div>
  </main>
);

const Filters = async ({ active }: { active?: string }) => {
  const genres = await Genre.list(Environment.SERVER);
  if (!genres.success) return null;
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <Link href="/discover">
        <Chip active={!active}>All universes</Chip>
      </Link>
      {genres.data.map((genre) => (
        <Link key={genre.id} href={`/discover?genre=${genre.slug}`}>
          <Chip active={active === genre.slug}>{genre.name}</Chip>
        </Link>
      ))}
    </div>
  );
};

const Grid = async ({ genre }: { genre?: string }) => {
  const [genres, universes] = await Promise.all([
    Genre.list(Environment.SERVER),
    Universe.trending(Environment.SERVER, { size: 48 }),
  ]);
  if (!universes.success) return null;

  const active =
    genre && genres.success
      ? genres.data.find((entry) => entry.slug === genre)
      : null;
  const filtered = active
    ? universes.data.filter((universe) => universe.genres.includes(active.id))
    : universes.data;

  if (filtered.length === 0)
    return (
      <p className="font-body text-foreground-dimmed">
        No universes in this genre yet.
      </p>
    );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {filtered.map((universe) => (
        <StoryCard key={universe.id} universe={universe} />
      ))}
    </div>
  );
};

// ── Fallbacks ─────────────────────────────────────────────────────────────────

const HeroEmpty = () => (
  <section className="flex h-[78vh] min-h-[520px] flex-col items-center justify-center bg-gradient-to-b from-background-rich to-background px-6 text-center">
    <p className="font-display text-foreground-dimmed/70 text-2xl italic">
      No universes yet.
    </p>
    <p className="mt-6 font-display text-foreground text-base">
      Build worlds together.
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

const GridSkeleton = () => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
    {Array.from({ length: 10 }).map((_value, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton grid
      <StoryCardSkeleton key={index} />
    ))}
  </div>
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
