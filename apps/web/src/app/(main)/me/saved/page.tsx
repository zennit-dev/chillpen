import { resultify } from "@zenncore/utils";
import { redirect } from "next/navigation";
import { StoryCard } from "@/components/story-card";
import * as Save from "@/server/app/save";
import * as Universe from "@/server/app/universe";
import { Environment } from "@/server/utils/environment";

export const metadata = { title: "Saved" };

export default async () => {
  const ids = await resultify(() => Save.savedUniverseIds(Environment.SERVER));
  if (!ids.success || !ids.data.success) redirect("/sign-in");

  const universes = await Universe.byIds(Environment.SERVER, ids.data.data);
  const cards = universes.success ? universes.data : [];

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="font-display font-semibold text-3xl text-foreground">
            Saved stories
          </h1>
          <p className="mt-2 font-body text-foreground-dimmed">
            The worlds and paths you bookmarked to return to.
          </p>
        </header>

        {cards.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {cards.map((universe) => (
              <StoryCard key={universe.id} universe={universe} saved />
            ))}
          </div>
        ) : (
          <p className="font-body text-foreground-dimmed">
            Nothing saved yet. Tap the heart on any story to keep it here.
          </p>
        )}
      </div>
    </main>
  );
};
