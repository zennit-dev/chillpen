"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, BranchIcon, PenIcon } from "@/components/icons";
import { formatCount } from "@/components/ui";
import * as ReadPath from "@/server/app/read-path";

export type Branch = {
  id: string;
  title: string;
  author: string | null;
  readCount: number;
  forkCount: number;
  likeCount: number;
};

export const BranchChoice = ({
  slug,
  universe,
  chapter,
  branches,
}: BranchChoice.Props) => {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  const choose = async (branch: Branch) => {
    setPending(branch.id);
    void ReadPath.choose({ universe, chapter: branch.id });
    router.push(`/story/${slug}/read/${branch.id}`);
  };

  return (
    <div className="mx-auto mt-16 max-w-2xl">
      {branches.length > 0 ? (
        <>
          <p className="mb-4 font-subtitle text-2xs text-foreground-dimmed uppercase tracking-[0.2em]">
            Choose your continuation
          </p>
          <div className="space-y-2.5">
            {branches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => void choose(branch)}
                disabled={pending !== null}
                className="group flex w-full items-center gap-4 rounded-[6px] border border-white/8 bg-background-rich p-4 text-left transition hover:border-primary/40 hover:bg-white/[0.03] disabled:opacity-60"
              >
                <BranchIcon className="size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-display font-medium text-foreground">
                    {branch.title}
                  </p>
                  <p className="mt-0.5 font-subtitle text-foreground-dimmed text-xs">
                    by {branch.author ?? "unknown"}
                  </p>
                </div>
                <div className="hidden items-center gap-3 font-subtitle text-2xs text-foreground-dimmed sm:flex">
                  <span>{formatCount(branch.readCount)} reads</span>
                  <span>{formatCount(branch.forkCount)} forks</span>
                  <span>{formatCount(branch.likeCount)} likes</span>
                </div>
                <ArrowRightIcon className="size-4 text-foreground-dimmed transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-[6px] border border-primary/20 border-dashed bg-primary/[0.04] p-6 text-center">
          <p className="font-display text-foreground text-lg">
            The edge of the universe.
          </p>
          <p className="mt-1 font-body text-foreground-dimmed text-sm">
            No one has continued this branch yet. Be the first.
          </p>
        </div>
      )}

      <a
        href={`/write?parent=${chapter}`}
        className="mt-3 flex items-center justify-center gap-2 rounded-[6px] border border-white/8 bg-transparent p-3.5 font-medium text-foreground-dimmed text-sm transition hover:border-primary/40 hover:text-primary"
      >
        <PenIcon className="size-4" />
        Write the next chapter
      </a>
    </div>
  );
};

export namespace BranchChoice {
  export type Props = {
    slug: string;
    universe: string;
    chapter: string;
    branches: Branch[];
  };
}
