import { cn } from "@zenncore/utils";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  BranchIcon,
  HeartIcon,
  TrophyIcon,
  UserIcon,
} from "@/components/icons";
import { Chip, formatCount } from "@/components/ui";
import { createMetadata } from "@/lib/seo";
import * as Genre from "@/server/app/genre";
import * as Leaderboard from "@/server/app/leaderboard";
import { Environment } from "@/server/utils/environment";
import { parseSearchParam } from "@/utils/search-params";

export const metadata = createMetadata({
  title: "Leaderboard",
  description:
    "The writers shaping the most-read, most-forked living universes on chillpen.",
  path: "/leaderboards",
});

export default async ({ searchParams }: PageProps<"/leaderboards">) => {
  const { genre: parameter } = await searchParams;
  const genre = parseSearchParam(parameter, "single");

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <p className="font-medium font-subtitle text-2xs text-foreground-dimmed uppercase tracking-[0.2em]">
            Reputation
          </p>
          <h1 className="mt-1 font-display font-semibold text-4xl text-foreground sm:text-5xl">
            Writer leaderboard
          </h1>
          <p className="mt-2 font-body text-foreground-dimmed">
            Ranked by reader love. Climb by writing branches people choose to
            follow.
          </p>
        </header>

        <Suspense fallback={null}>
          <GenreFilter active={genre} />
        </Suspense>

        <Suspense fallback={<BoardSkeleton />}>
          <Board genre={genre} />
        </Suspense>
      </div>
    </main>
  );
};

const GenreFilter = async ({ active }: { active?: string }) => {
  const genres = await Genre.list(Environment.SERVER);
  if (!genres.success) return null;
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <Link href="/leaderboards">
        <Chip active={!active}>All universes</Chip>
      </Link>
      {genres.data.map((genre) => (
        <Link key={genre.id} href={`/leaderboards?genre=${genre.slug}`}>
          <Chip active={active === genre.slug}>{genre.name}</Chip>
        </Link>
      ))}
    </div>
  );
};

const Board = async ({ genre }: { genre?: string }) => {
  const genres = await Genre.list(Environment.SERVER);
  const genreId =
    genre && genres.success
      ? genres.data.find((entry) => entry.slug === genre)?.id
      : undefined;

  const writers = await Leaderboard.topWriters(Environment.SERVER, {
    size: 25,
    genre: genreId,
  });
  const standings = writers.success ? writers.data : [];

  if (standings.length === 0)
    return (
      <p className="font-body text-foreground-dimmed">
        No writers ranked in this genre yet.
      </p>
    );

  return (
    <ol className="space-y-2">
      {standings.map((writer) => (
        <li key={writer.user}>
          <Link
            href={`/u/${writer.pseudonym}`}
            className="flex items-center gap-4 rounded-[10px] border border-white/8 bg-background-rich p-3 transition hover:border-primary/30 hover:bg-white/[0.02] sm:p-4"
          >
            <span
              className={cn(
                "w-8 shrink-0 text-center font-display font-semibold text-xl tabular-nums",
                writer.rank <= 3 ? "text-primary" : "text-foreground-dimmed",
              )}
            >
              {writer.rank}
            </span>
            <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 font-display font-semibold text-lg text-primary ring-1 ring-white/10">
              {writer.image ? (
                <Image
                  src={writer.image}
                  alt=""
                  width={44}
                  height={44}
                  className="size-full object-cover"
                />
              ) : (
                writer.pseudonym.charAt(0).toUpperCase()
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-display font-medium text-foreground">
                <span className="truncate">{writer.pseudonym}</span>
                {writer.rank === 1 ? (
                  <TrophyIcon className="size-4 shrink-0 text-primary" />
                ) : null}
              </p>
              <div className="mt-0.5 flex items-center gap-3 font-subtitle text-2xs text-foreground-dimmed">
                <span className="inline-flex items-center gap-1">
                  <UserIcon className="size-3" />
                  {formatCount(writer.reads)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <BranchIcon className="size-3" />
                  {formatCount(writer.forks)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <HeartIcon className="size-3" />
                  {formatCount(writer.likes)}
                </span>
              </div>
            </div>
            <span className="hidden text-right font-subtitle text-foreground-dimmed text-xs sm:block">
              <span className="block font-display font-semibold text-foreground text-sm">
                {formatCount(writer.score)}
              </span>
              points
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
};

const BoardSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 8 }).map((_value, index) => (
      <div
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton row
        key={index}
        className="h-[68px] animate-pulse rounded-[10px] border border-white/8 bg-background-rich"
      />
    ))}
  </div>
);
