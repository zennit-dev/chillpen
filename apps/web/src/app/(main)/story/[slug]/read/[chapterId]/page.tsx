import Link from "next/link";
import { notFound } from "next/navigation";
import { MapIcon } from "@/components/icons";
import * as Chapter from "@/server/app/chapter";
import { Environment } from "@/server/utils/environment";
import { Continuations } from "../../_components/continuations";
import { ReadingView } from "../../_components/reading-view";

type Params = { params: Promise<{ slug: string; chapterId: string }> };

export default async ({ params }: Params) => {
  const { slug, chapterId } = await params;
  const result = await Chapter.augmented(Environment.SERVER, chapterId);
  if (!result.success || !result.data) notFound();

  const chapter = result.data;
  await Chapter.incrementReads(Environment.SERVER, { chapter: chapterId });

  const author = chapter.author?.pseudonym ?? chapter.author?.name ?? "unknown";

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto mb-10 flex max-w-2xl items-center justify-between">
        <Link
          href={`/story/${slug}`}
          className="font-subtitle text-foreground-dimmed text-sm transition hover:text-foreground"
        >
          ← Back to universe
        </Link>
        <Link
          href={`/story/${slug}/map`}
          className="inline-flex items-center gap-1.5 font-subtitle text-foreground-dimmed text-sm transition hover:text-primary"
        >
          <MapIcon className="size-4" />
          Map
        </Link>
      </div>

      <ReadingView
        title={chapter.title}
        body={chapter.body}
        author={author}
        wordCount={chapter.wordCount}
      />
      <Continuations
        slug={slug}
        universe={chapter.universeId}
        chapter={chapter.id}
      />
    </main>
  );
};
