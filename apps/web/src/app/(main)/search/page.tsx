import { Suspense } from "react";
import { StoryCard } from "@/components/story-card";
import { createMetadata } from "@/lib/seo";
import * as Universe from "@/server/app/universe";
import { Environment } from "@/server/utils/environment";
import { SearchBox } from "./_components/search-box";

type Params = { searchParams: Promise<{ q?: string }> };

export const metadata = createMetadata({
  title: "Search",
  description: "Search living, branching universes across chillpen.",
  path: "/search",
});

export default async ({ searchParams }: Params) => {
  const { q } = await searchParams;

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-5 font-display font-semibold text-3xl text-foreground">
          Search
        </h1>
        <SearchBox initial={q ?? ""} />
        <div className="mt-8">
          <Suspense key={q ?? ""} fallback={null}>
            <Results query={q ?? ""} />
          </Suspense>
        </div>
      </div>
    </main>
  );
};

async function Results({ query }: { query: string }) {
  if (!query.trim())
    return (
      <p className="font-body text-foreground-dimmed">
        Start typing to explore the catalog.
      </p>
    );

  const result = await Universe.search(Environment.SERVER, query);
  const items = result.success ? result.data : [];

  if (items.length === 0)
    return (
      <p className="font-body text-foreground-dimmed">
        No universes match “{query}”.
      </p>
    );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {items.map((universe) => (
        <StoryCard key={universe.id} universe={universe} />
      ))}
    </div>
  );
}
