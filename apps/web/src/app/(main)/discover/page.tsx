import Link from "next/link";
import { Suspense } from "react";
import { StoryCard, StoryCardSkeleton } from "@/components/story-card";
import { Chip } from "@/components/ui";
import { createMetadata } from "@/lib/seo";
import * as Genre from "@/server/app/genre";
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

  return (
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
};

const Filters = async ({ active }: { active?: string }) => {
  const genres = await Genre.list(Environment.SERVER);
  if (!genres.success) return null;
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <Link href="/discover">
        <Chip active={!active}>All</Chip>
      </Link>
      {genres.data.map((genre) => (
        <Link key={genre.id} href={`/discover?genre=${genre.slug}`}>
          <Chip active={active === genre.slug}>{genre.name}</Chip>
        </Link>
      ))}
    </div>
  );
};

async function Grid({ genre }: { genre?: string }) {
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
}

const GridSkeleton = () => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
    {Array.from({ length: 10 }).map((_value, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton grid
      <StoryCardSkeleton key={index} />
    ))}
  </div>
);
