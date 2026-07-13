import Image from "next/image";
import Link from "next/link";
import { CoinIcon, SparkleIcon, TrophyIcon } from "@/components/icons";
import { Chip, formatCount } from "@/components/ui";
import { resolveMediaUrl } from "@/lib/assets";
import { createMetadata } from "@/lib/seo";
import type * as Challenge from "@/server/app/challenge";
import * as ChallengeApp from "@/server/app/challenge";
import { Environment } from "@/server/utils/environment";

export const metadata = createMetadata({
  title: "Challenges",
  description:
    "Weekly writing prompts and community jams with exclusive cosmetic prizes.",
  path: "/challenges",
});

export default async () => {
  const result = await ChallengeApp.active(Environment.SERVER);
  const challenges = result.success ? result.data : [];

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="font-display font-semibold text-3xl text-foreground sm:text-4xl">
            Weekly challenges
          </h1>
          <p className="mt-2 font-body text-foreground-dimmed">
            Themed prompts and writing jams. Win exclusive cosmetics that can't
            be bought.
          </p>
        </header>

        {challenges.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        ) : (
          <p className="font-body text-foreground-dimmed">
            No active challenges right now — check back soon.
          </p>
        )}
      </div>
    </main>
  );
};

const ChallengeCard = ({ challenge }: { challenge: Challenge.Type }) => {
  const days = Math.max(
    0,
    Math.ceil((challenge.endsAt.getTime() - Date.now()) / 86_400_000),
  );
  const cover =
    resolveMediaUrl(challenge.cover) ??
    `https://picsum.photos/seed/challenge-${challenge.slug}/640/360`;

  return (
    <article className="overflow-hidden rounded-[8px] border border-white/8 bg-background-rich">
      <div className="relative aspect-[16/9]">
        <Image
          src={cover}
          alt={challenge.title}
          fill
          sizes="(max-width: 640px) 100vw, 400px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-rich to-transparent" />
        <div className="absolute top-3 left-3">
          <Chip active>{challenge.status}</Chip>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <h2 className="font-display font-medium text-foreground text-xl">
          {challenge.title}
        </h2>
        <p className="font-body text-foreground-dimmed text-sm leading-relaxed">
          {challenge.prompt}
        </p>
        <div className="flex flex-wrap items-center gap-3 font-subtitle text-xs">
          <span className="inline-flex items-center gap-1 text-primary">
            <CoinIcon className="size-3.5" />
            {formatCount(challenge.prizeCoins)}
          </span>
          {challenge.prizeCosmeticId ? (
            <span className="inline-flex items-center gap-1 text-primary">
              <TrophyIcon className="size-3.5" />
              Exclusive cosmetic
            </span>
          ) : null}
          <span className="ml-auto text-foreground-dimmed">
            {days} days left
          </span>
        </div>
        <Link
          href="/write"
          className="mt-1 inline-flex items-center gap-1.5 rounded-[4px] bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:bg-primary-rich"
        >
          <SparkleIcon className="size-4" />
          Enter challenge
        </Link>
      </div>
    </article>
  );
};
