import { resultify } from "@zenncore/utils";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  BranchIcon,
  MapIcon,
  PenIcon,
  PlayIcon,
  StarIcon,
  UserIcon,
} from "@/components/icons";
import { SaveButton } from "@/components/save-button";
import { Chip, formatCount, Stat } from "@/components/ui";
import { resolveMediaUrl } from "@/lib/assets";
import { createMetadata, createUniverseSchema, seo } from "@/lib/seo";
import * as Save from "@/server/app/save";
import * as Universe from "@/server/app/universe";
import { Environment } from "@/server/utils/environment";
import { Continuations } from "./_components/continuations";
import { ReadingView } from "./_components/reading-view";

type Params = { params: Promise<{ slug: string }> };

export const generateMetadata = async ({
  params,
}: Params): Promise<Metadata> => {
  const { slug } = await params;
  const result = await Universe.bySlug(Environment.SERVER, slug);
  if (!result.success || !result.data)
    return createMetadata({
      title: "Universe",
      description: seo.description,
      path: `/story/${slug}`,
    });
  return createMetadata({
    title: result.data.title,
    description: result.data.description ?? seo.description,
    path: `/story/${slug}`,
    type: "book",
  });
};

export default async ({ params }: Params) => {
  const { slug } = await params;
  const result = await Universe.augmented(Environment.SERVER, slug);
  if (!result.success || !result.data) notFound();

  const universe = result.data;
  const root = universe.rootChapter;
  const author =
    universe.originatingAuthor?.pseudonym ??
    universe.originatingAuthor?.name ??
    "unknown";
  const cover =
    resolveMediaUrl(universe.cover) ??
    `https://picsum.photos/seed/${universe.slug}/1280/720`;

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            createUniverseSchema({
              title: universe.title,
              description: universe.description ?? seo.description,
              slug: universe.slug,
              author,
              genres: universe.genres.map((genre) => genre.name),
              rating: universe.rating,
            }),
          ),
        }}
      />
      <section className="relative">
        <div
          className="absolute inset-0 h-[64vh] min-h-[420px]"
          style={{ viewTransitionName: "story-cover" }}
        >
          <Image
            src={cover}
            alt={universe.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pt-[26vh] pb-12 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            {universe.genres.map((genre) => (
              <Chip key={genre.id} active>
                {genre.name}
              </Chip>
            ))}
          </div>
          <h1 className="mt-4 max-w-3xl font-display font-semibold text-5xl text-foreground leading-[0.95] tracking-tight sm:text-6xl">
            {universe.title}
          </h1>
          <p className="mt-4 max-w-xl font-body text-base text-foreground-rich leading-relaxed sm:text-lg">
            {universe.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-subtitle text-foreground-dimmed text-sm">
            <Link
              href={`/u/${author}`}
              className="inline-flex items-center gap-1.5 text-foreground-rich transition hover:text-primary"
            >
              <UserIcon className="size-4" />
              {author}
            </Link>
            <Stat
              icon={<StarIcon className="size-4 fill-current text-primary" />}
              value={(universe.rating / 10).toFixed(1)}
            />
            <Stat
              icon={<BranchIcon className="size-4" />}
              value={formatCount(universe.forkCount)}
              label="branches"
            />
            <span>{formatCount(universe.readCount)} reads</span>
            <span>{universe.contributorCount} writers</span>
            <span>{universe.completion}% complete</span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {root ? (
              <Link
                href={`/story/${slug}/read/${root.id}`}
                className="inline-flex items-center gap-2 rounded-[4px] bg-foreground px-7 py-2.5 font-medium text-background text-sm transition hover:bg-foreground/90"
              >
                <PlayIcon className="size-4" />
                Read
              </Link>
            ) : null}
            <Link
              href={`/story/${slug}/map`}
              className="glass inline-flex items-center gap-2 rounded-[4px] px-5 py-2.5 font-medium text-foreground text-sm transition hover:border-primary/40"
            >
              <MapIcon className="size-4" />
              Universe map
            </Link>
            <Link
              href={`/write?universe=${universe.id}${root ? `&parent=${root.id}` : ""}`}
              className="glass inline-flex items-center gap-2 rounded-[4px] px-5 py-2.5 font-medium text-foreground text-sm transition hover:border-primary/40"
            >
              <PenIcon className="size-4" />
              Add a branch
            </Link>
            <Suspense
              fallback={
                <SaveButton universe={universe.id} className="size-10" />
              }
            >
              <SaveSlot universe={universe.id} />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        {root ? (
          <>
            <ReadingView
              title={root.title}
              body={root.body}
              author={author}
              wordCount={root.wordCount}
            />
            <Continuations
              slug={slug}
              universe={universe.id}
              chapter={root.id}
            />
          </>
        ) : (
          <p className="mx-auto max-w-2xl text-center font-body text-foreground-dimmed">
            This universe has no chapters yet.
          </p>
        )}
      </section>
    </main>
  );
};

// Streamed so the reader's saved state (a cookie read) never blocks the static
// story shell — the heart hydrates pre-filled when they've already saved it.
const SaveSlot = async ({ universe }: { universe: string }) => {
  const saved = await resultify(() =>
    Save.savedUniverseIds(Environment.SERVER),
  );
  const isSaved =
    saved.success && saved.data.success && saved.data.data.includes(universe);
  return <SaveButton universe={universe} saved={isSaved} className="size-10" />;
};
