import { resultify } from "@zenncore/utils";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BranchIcon, HeartIcon, ShareIcon, UserIcon } from "@/components/icons";
import { StoryCard } from "@/components/story-card";
import { Chip, formatCount } from "@/components/ui";
import { createMetadata, createPersonSchema } from "@/lib/seo";
import * as Follow from "@/server/app/follow";
import * as Universe from "@/server/app/universe";
import * as User from "@/server/app/user";
import { Environment } from "@/server/utils/environment";
import { FollowButton } from "./_components/follow-button";

type Params = { params: Promise<{ pseudonym: string }> };

export const generateMetadata = async ({
  params,
}: Params): Promise<Metadata> => {
  const { pseudonym } = await params;
  const account = await User.byPseudonym(Environment.SERVER, pseudonym);
  const bio =
    account.success && account.data?.bio
      ? account.data.bio
      : `${pseudonym} builds living, branching worlds on chillpen.`;
  return createMetadata({
    title: `${pseudonym} — creator`,
    description: bio,
    path: `/u/${pseudonym}`,
    type: "profile",
  });
};

export default async ({ params }: Params) => {
  const { pseudonym } = await params;
  const account = await User.byPseudonym(Environment.SERVER, pseudonym);
  if (!account.success || !account.data) notFound();

  const user = account.data;
  const [universes, following] = await Promise.all([
    Universe.byAuthor(Environment.SERVER, user.id),
    resultify(() =>
      Follow.isFollowing(Environment.SERVER, { writer: user.id }),
    ),
  ]);

  const cards = universes.success ? universes.data : [];
  const reads = cards.reduce((sum, universe) => sum + universe.readCount, 0);
  const forks = cards.reduce((sum, universe) => sum + universe.forkCount, 0);
  const likes = cards.reduce((sum, universe) => sum + universe.likeCount, 0);
  const isFollowing =
    following.success && following.data.success ? following.data.data : false;
  const hasFrame = Boolean(user.avatarConfig?.frame);

  return (
    <main>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            createPersonSchema({ pseudonym, bio: user.bio ?? "" }),
          ),
        }}
      />
      <section className="relative h-56 sm:h-64">
        {user.banner ? (
          <Image
            src={user.banner}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/25 via-background-rich to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative -mt-16 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <span
              className={`flex size-28 items-center justify-center rounded-full bg-background-rich font-display font-semibold text-4xl text-primary ${
                hasFrame ? "ring-4 ring-primary" : "ring-2 ring-white/10"
              }`}
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt={pseudonym}
                  width={112}
                  height={112}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                pseudonym.charAt(0).toUpperCase()
              )}
            </span>
            <div className="pb-1">
              <h1 className="font-display font-semibold text-3xl text-foreground">
                {pseudonym}
              </h1>
              {user.bio ? (
                <p className="mt-1 max-w-md font-body text-foreground-dimmed text-sm">
                  {user.bio}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FollowButton writer={user.id} following={isFollowing} />
            <button
              type="button"
              aria-label="Share profile"
              className="flex size-9 items-center justify-center rounded-full border border-white/12 text-foreground-dimmed transition hover:border-primary/40 hover:text-primary"
            >
              <ShareIcon className="size-4" />
            </button>
          </div>
        </div>

        {user.badges.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {user.badges.map((badge) => (
              <Chip key={badge} active>
                {badge.replace(/-/g, " ")}
              </Chip>
            ))}
          </div>
        ) : null}

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ProfileStat
            label="Followers"
            value={formatCount(user.followerCount)}
          />
          <ProfileStat
            label="Reads"
            value={formatCount(reads)}
            icon={<UserIcon className="size-4" />}
          />
          <ProfileStat
            label="Branches"
            value={formatCount(forks)}
            icon={<BranchIcon className="size-4" />}
          />
          <ProfileStat
            label="Likes"
            value={formatCount(likes)}
            icon={<HeartIcon className="size-4" />}
          />
        </div>

        <section className="mt-12 pb-20">
          <h2 className="mb-4 font-display font-medium text-foreground text-xl">
            Universes & branches
          </h2>
          {cards.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {cards.map((universe) => (
                <StoryCard key={universe.id} universe={universe} />
              ))}
            </div>
          ) : (
            <p className="font-body text-foreground-dimmed">
              No published universes yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
};

const ProfileStat = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) => (
  <div className="rounded-[6px] border border-white/8 bg-background-rich p-4">
    <p className="flex items-center gap-1.5 font-display font-semibold text-2xl text-foreground">
      {icon ? <span className="text-primary">{icon}</span> : null}
      {value}
    </p>
    <p className="mt-0.5 font-subtitle text-2xs text-foreground-dimmed uppercase tracking-wider">
      {label}
    </p>
  </div>
);
