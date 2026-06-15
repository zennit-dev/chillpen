import * as Genre from "@/server/app/genre";
import { Environment } from "@/server/utils/environment";
import { parseSearchParam } from "@/utils/search-params";
import { Studio } from "./_components/studio";

export const metadata = { title: "Writer Studio" };

export default async ({ searchParams }: PageProps<"/write">) => {
  const { parent, universe } = await searchParams;
  const parentId = parseSearchParam(parent, "single") || undefined;
  const universeId = parseSearchParam(universe, "single") || undefined;
  const genres = await Genre.list(Environment.SERVER);

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <p className="font-subtitle text-2xs text-primary uppercase tracking-widest">
            {parentId ? "New continuation" : "New universe"}
          </p>
          <h1 className="mt-2 font-display font-semibold text-3xl text-foreground">
            Writer Studio
          </h1>
          <p className="mt-2 max-w-md font-body text-foreground-dimmed text-sm leading-relaxed">
            Fixed typography keeps every story on-brand — you write the words,
            chillpen handles the look. Submitted chapters pass AI moderation
            before going live.
          </p>
        </header>

        <Studio
          parent={parentId}
          universe={universeId}
          genres={
            genres.success
              ? genres.data.map((genre) => ({ id: genre.id, name: genre.name }))
              : []
          }
        />
      </div>
    </main>
  );
};
