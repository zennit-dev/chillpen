import { cn } from "@zenncore/utils";
import Link from "next/link";
import { BranchIcon, StarIcon, UserIcon } from "@/components/icons";
import { SaveButton } from "@/components/save-button";
import { StoryCover } from "@/components/story-cover";
import { formatCount, Stat } from "@/components/ui";
import { resolveMediaUrl } from "@/lib/assets";
import type * as Universe from "@/server/app/universe";

const fallbackCover = (slug: string) =>
  `https://picsum.photos/seed/chillpen-${slug}/600/400`;

export const StoryCard = ({ universe, saved, className }: StoryCard.Props) => (
  <article
    className={cn(
      "group/card relative w-full overflow-hidden rounded-md bg-background-rich ring-1 ring-white/8 transition duration-300 hover:z-10 hover:-translate-y-1 hover:ring-primary/30 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]",
      className,
    )}
  >
    <StoryCover
      slug={universe.slug}
      cover={
        resolveMediaUrl(universe.cover) ?? fallbackCover(universe.slug)
      }
      title={universe.title}
      genre={universe.genreNames[0]}
    />

    <Link href={`/story/${universe.slug}`} className="block">
      <div className="space-y-2 p-3">
        <h3 className="line-clamp-1 font-display font-medium text-base text-foreground">
          {universe.title}
        </h3>
        <p className="flex items-center gap-1.5 font-subtitle text-foreground-dimmed text-xs">
          <UserIcon className="size-3.5" />
          {universe.author ?? "unknown"}
        </p>
        <div className="flex items-center gap-3 pt-0.5">
          <Stat
            icon={<StarIcon className="size-3.5 fill-current text-primary" />}
            value={(universe.rating / 10).toFixed(1)}
          />
          <Stat
            icon={<BranchIcon className="size-3.5" />}
            value={formatCount(universe.forkCount)}
          />
          <span className="ml-auto font-subtitle text-2xs text-foreground-dimmed">
            {universe.completion}% complete
          </span>
        </div>
      </div>
    </Link>

    <div className="absolute top-2.5 right-2.5">
      <SaveButton universe={universe.id} saved={saved} />
    </div>

    {/* hover reveal — synopsis + contributors, contained to avoid carousel clipping */}
    <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-background-rich via-background-rich/95 to-transparent p-3 pt-8 opacity-0 transition duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100">
      <div className="flex items-center gap-3 font-subtitle text-2xs text-foreground-dimmed">
        <span>{formatCount(universe.readCount)} reads</span>
        <span>{universe.contributorCount} writers</span>
        <span>{formatCount(universe.saveCount)} saves</span>
      </div>
    </div>
  </article>
);

export namespace StoryCard {
  export type Props = {
    universe: Universe.Card;
    saved?: boolean;
    className?: string;
  };
}

export const StoryCardSkeleton = ({ className }: StoryCardSkeleton.Props) => (
  <div
    className={cn(
      "w-full animate-pulse overflow-hidden rounded-md bg-background-rich ring-1 ring-white/8",
      className,
    )}
  >
    <div className="aspect-[16/10] bg-white/5" />
    <div className="space-y-2 p-3">
      <div className="h-4 w-3/4 rounded bg-white/8" />
      <div className="h-3 w-1/2 rounded bg-white/5" />
      <div className="h-3 w-2/3 rounded bg-white/5" />
    </div>
  </div>
);

export namespace StoryCardSkeleton {
  export type Props = {
    className?: string;
  };
}
