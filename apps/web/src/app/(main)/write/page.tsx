import { resultify } from "@zenncore/utils";
import { redirect } from "next/navigation";
import * as Authentication from "@/server/app/authentication";
import * as Chapter from "@/server/app/chapter";
import * as Genre from "@/server/app/genre";
import * as Universe from "@/server/app/universe";
import { Environment } from "@/server/utils/environment";
import { parseSearchParam } from "@/utils/search-params";
import { Studio } from "./_components/studio";

export const metadata = { title: "Writer Studio" };

export default async ({ searchParams }: PageProps<"/write">) => {
  const proxied = await resultify(() =>
    Authentication.getProxiedCurrentUser(Environment.SERVER),
  );
  if (!proxied.success || !proxied.data.success) redirect("/sign-in");

  const { parent, universe } = await searchParams;
  const parentId = parseSearchParam(parent, "single") || undefined;
  const universeId = parseSearchParam(universe, "single") || undefined;

  const [genres, pool, preselected, chapters] = await Promise.all([
    Genre.list(Environment.SERVER),
    Universe.trending(Environment.SERVER, { size: 40 }),
    universeId
      ? Universe.get(Environment.SERVER, universeId)
      : Promise.resolve({ success: true as const, data: null }),
    universeId
      ? Chapter.tree(Environment.SERVER, { universe: universeId })
      : Promise.resolve({ success: true as const, data: [] }),
  ]);

  // Universe pool for "Continue a universe", with the preselected one guaranteed
  // present even if it isn't currently trending.
  const universes = (() => {
    const base = pool.success
      ? pool.data.map((entry) => ({
          id: entry.id,
          title: entry.title,
          slug: entry.slug,
        }))
      : [];
    if (
      preselected.success &&
      preselected.data &&
      !base.some((entry) => entry.id === preselected.data.id)
    )
      return [
        {
          id: preselected.data.id,
          title: preselected.data.title,
          slug: preselected.data.slug,
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
            Write
          </h1>
          <p className="mt-2 max-w-lg font-body text-foreground-dimmed text-sm leading-relaxed">
            Fixed Instrument Serif typography — the way readers will see it. You
            write the words, chillpen handles the look. Submitted chapters pass
            AI moderation before going live.
          </p>
        </header>

        <Studio
          genres={
            genres.success
              ? genres.data.map((genre) => ({ id: genre.id, name: genre.name }))
              : []
          }
          universes={universes}
          preselectedUniverse={universeId}
          preselectedParent={parentId}
          preselectedChapters={
            chapters.success
              ? chapters.data.map((node) => ({
                  id: node.id,
                  title: node.title,
                  depth: node.depth,
                }))
              : []
          }
        />
      </div>
    </main>
  );
};
