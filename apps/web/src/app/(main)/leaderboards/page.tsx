import { cn } from "@zenncore/utils";
import Link from "next/link";
import { FireIcon, TrophyIcon } from "@/components/icons";
import { formatCount } from "@/components/ui";
import { createMetadata } from "@/lib/seo";
import * as Leaderboard from "@/server/app/leaderboard";
import type { LeaderboardEntry } from "@/server/database/schema";
import { Environment } from "@/server/utils/environment";

export const metadata = createMetadata({
  title: "Leaderboards",
  description:
    "The writers shaping the most-read, most-forked living universes on chillpen.",
  path: "/leaderboards",
});

export default async () => {
  const [snapshot, rising] = await Promise.all([
    Leaderboard.bySnapshot(Environment.SERVER, {
      scope: "global",
      period: "all-time",
    }),
    Leaderboard.risingWriters(Environment.SERVER, { size: 12 }),
  ]);

  const top = snapshot.success && snapshot.data ? snapshot.data.entries : [];
  const risers = rising.success ? rising.data : [];

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="font-display font-semibold text-3xl text-foreground sm:text-4xl">
            Leaderboards
          </h1>
          <p className="mt-2 font-body text-foreground-dimmed">
            The writers shaping the most-read, most-forked universes.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <Board
            title="Top Creators"
            icon={<TrophyIcon className="size-5 text-primary" />}
            entries={top}
          />
          <Board
            title="Rising Writers"
            icon={<FireIcon className="size-5 text-primary" />}
            entries={risers}
          />
        </div>
      </div>
    </main>
  );
};

const Board = ({
  title,
  icon,
  entries,
}: {
  title: string;
  icon: React.ReactNode;
  entries: LeaderboardEntry[];
}) => (
  <section>
    <h2 className="mb-3 flex items-center gap-2 font-display font-medium text-foreground text-xl">
      {icon}
      {title}
    </h2>
    {entries.length > 0 ? (
      <ol className="space-y-1.5">
        {entries.map((entry) => (
          <li key={entry.user}>
            <Link
              href={`/u/${entry.pseudonym}`}
              className="flex items-center gap-3 rounded-[6px] border border-white/8 bg-background-rich p-3 transition hover:border-primary/30"
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full font-display font-semibold text-xs",
                  entry.rank <= 3
                    ? "bg-primary/20 text-primary"
                    : "bg-white/5 text-foreground-dimmed",
                )}
              >
                {entry.rank}
              </span>
              <span className="flex-1 truncate font-display font-medium text-foreground text-sm">
                {entry.pseudonym}
              </span>
              <span className="font-subtitle text-foreground-dimmed text-xs">
                {formatCount(entry.score)} pts
              </span>
            </Link>
          </li>
        ))}
      </ol>
    ) : (
      <p className="font-body text-foreground-dimmed text-sm">
        No rankings yet.
      </p>
    )}
  </section>
);
