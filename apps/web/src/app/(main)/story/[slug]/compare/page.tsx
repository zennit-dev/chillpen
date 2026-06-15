import Link from "next/link";
import { notFound } from "next/navigation";
import type * as Chapter from "@/server/app/chapter";
import * as ChapterApp from "@/server/app/chapter";
import * as ReadPath from "@/server/app/read-path";
import * as Universe from "@/server/app/universe";
import { Environment } from "@/server/utils/environment";
import { parseSearchParam } from "@/utils/search-params";

export default async ({
  params,
  searchParams,
}: PageProps<"/story/[slug]/compare">) => {
  const { slug } = await params;
  const { a, b } = await searchParams;

  const universe = await Universe.augmented(Environment.SERVER, slug);
  if (!universe.success || !universe.data) notFound();

  const root = universe.data.rootChapter;
  const fallback = root
    ? await ChapterApp.continuations(Environment.SERVER, { chapter: root.id })
    : null;
  const branches = fallback?.success ? fallback.data : [];

  const first = parseSearchParam(a, "single") || branches[0]?.id;
  const second = parseSearchParam(b, "single") || branches[1]?.id;

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/story/${slug}`}
          className="font-subtitle text-foreground-dimmed text-sm transition hover:text-foreground"
        >
          ← {universe.data.title}
        </Link>
        <header className="mt-4 mb-8">
          <h1 className="font-display font-semibold text-2xl text-foreground sm:text-3xl">
            Compare timelines
          </h1>
          <p className="font-subtitle text-foreground-dimmed text-sm">
            What if you'd gone the other way?
          </p>
        </header>

        {first && second ? (
          <Timelines first={first} second={second} slug={slug} />
        ) : (
          <p className="font-body text-foreground-dimmed">
            This branch needs at least two continuations to compare.
          </p>
        )}
      </div>
    </main>
  );
};

const Timelines = async ({
  first,
  second,
  slug,
}: {
  first: string;
  second: string;
  slug: string;
}) => {
  const result = await ReadPath.compare(Environment.SERVER, {
    branches: [first, second],
  });
  if (!result.success)
    return (
      <p className="font-body text-foreground-dimmed">
        Could not load branches.
      </p>
    );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Column chapter={result.data.first} slug={slug} />
      <Column chapter={result.data.second} slug={slug} />
    </div>
  );
};

const Column = ({
  chapter,
  slug,
}: {
  chapter: Chapter.AugmentedChapter | null;
  slug: string;
}) => {
  if (!chapter)
    return (
      <div className="rounded-[8px] border border-white/8 border-dashed bg-background-rich p-6 text-foreground-dimmed">
        Branch not found.
      </div>
    );

  const paragraphs = chapter.body.split(/\n{2,}/).filter(Boolean);
  return (
    <div className="rounded-[8px] border border-white/8 bg-background-rich p-6">
      <p className="font-subtitle text-2xs text-primary uppercase tracking-widest">
        {chapter.author?.pseudonym ?? chapter.author?.name ?? "unknown"}
      </p>
      <h2 className="mt-2 font-display font-medium text-foreground text-xl">
        {chapter.title}
      </h2>
      <div className="mt-4 space-y-4 font-reading text-foreground-rich text-lg leading-[1.8]">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>
      <Link
        href={`/story/${slug}/read/${chapter.id}`}
        className="mt-5 inline-block font-medium text-primary text-sm transition hover:text-primary-rich"
      >
        Continue this branch →
      </Link>
    </div>
  );
};
