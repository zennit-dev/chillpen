import { resultify } from "@zenncore/utils";
import { redirect } from "next/navigation";
import * as Authentication from "@/server/app/authentication";
import * as Chapter from "@/server/app/chapter";
import * as Genre from "@/server/app/genre";
import * as Universe from "@/server/app/universe";
import { Environment } from "@/server/utils/environment";
import { Studio } from "../_components/studio";

export const metadata = { title: "Edit chapter" };

export default async ({ params }: PageProps<"/write/[chapterId]">) => {
  const { chapterId } = await params;

  const proxied = await resultify(() =>
    Authentication.getProxiedCurrentUser(Environment.SERVER),
  );
  if (!proxied.success || !proxied.data.success) redirect("/sign-in");
  const user = proxied.data.data;

  const chapter = await Chapter.get(Environment.SERVER, chapterId);
  if (!chapter.success || !chapter.data) redirect("/write");
  if (chapter.data.authorId !== user.id) redirect("/write");
  if (!["draft", "submitted", "rejected"].includes(chapter.data.status))
    redirect("/write");

  const [genres, pool, universeRecord, chapters] = await Promise.all([
    Genre.list(Environment.SERVER),
    Universe.trending(Environment.SERVER, { size: 40 }),
    Universe.get(Environment.SERVER, chapter.data.universeId),
    Chapter.tree(Environment.SERVER, { universe: chapter.data.universeId }),
  ]);

  const universes = (() => {
    const base = pool.success
      ? pool.data.map((entry) => ({
          id: entry.id,
          title: entry.title,
          slug: entry.slug,
        }))
      : [];
    if (
      universeRecord.success &&
      universeRecord.data &&
      !base.some((entry) => entry.id === universeRecord.data.id)
    )
      return [
        {
          id: universeRecord.data.id,
          title: universeRecord.data.title,
          slug: universeRecord.data.slug,
        },
        ...base,
      ];
    return base;
  })();

  return (
    <main className="px-4 pt-24 pb-20 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7">
          <p className="font-medium font-subtitle text-2xs text-primary uppercase tracking-[0.2em]">
            Writer Studio
          </p>
          <h1 className="mt-2 font-display font-semibold text-4xl text-foreground">
            Edit chapter
          </h1>
          <p className="mt-2 max-w-lg font-body text-foreground-dimmed text-sm leading-relaxed">
            Continue editing your draft. Save anytime or submit for review when
            you are ready.
          </p>
        </header>

        <Studio
          genres={
            genres.success
              ? genres.data.map((genre) => ({ id: genre.id, name: genre.name }))
              : []
          }
          universes={universes}
          preselectedUniverse={chapter.data.universeId}
          preselectedParent={chapter.data.parentChapterId ?? undefined}
          preselectedChapters={
            chapters.success
              ? chapters.data.map((node) => ({
                  id: node.id,
                  title: node.title,
                  depth: node.depth,
                }))
              : []
          }
          existingChapter={{
            id: chapter.data.id,
            universe: chapter.data.universeId,
            parent: chapter.data.parentChapterId,
            title: chapter.data.title,
            body: chapter.data.body,
            summary: chapter.data.summary,
          }}
        />
      </div>
    </main>
  );
};
