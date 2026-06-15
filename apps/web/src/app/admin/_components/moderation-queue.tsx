"use client";

import { Button } from "@zenncore/web/components/button";
import { useState } from "react";
import * as Chapter from "@/server/app/chapter";
import type * as Moderation from "@/server/app/moderation";

export const ModerationQueue = ({ items }: ModerationQueue.Props) => {
  const [pending, setPending] = useState(items);
  const [busy, setBusy] = useState<string | null>(null);

  const decide = async (
    entry: Moderation.QueueItem,
    action: "approve" | "reject",
  ) => {
    setBusy(entry.id);
    const result =
      action === "approve"
        ? await Chapter.approve({ chapter: entry.chapterId })
        : await Chapter.reject({
            chapter: entry.chapterId,
            reason: "Does not meet community guidelines.",
          });
    setBusy(null);
    if (result.success)
      setPending((current) => current.filter((item) => item.id !== entry.id));
  };

  return (
    <section>
      <h2 className="mb-1 font-display font-medium text-foreground text-xl">
        Moderation queue
      </h2>
      <p className="mb-4 font-body text-foreground-dimmed text-sm">
        Submitted chapters awaiting review.
      </p>
      {pending.length > 0 ? (
        <div className="space-y-2">
          {pending.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 rounded-[6px] border border-white/8 bg-background-rich p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-medium text-foreground text-sm">
                  {entry.chapter?.title ?? "Untitled chapter"}
                </p>
                <p className="font-subtitle text-foreground-dimmed text-xs">
                  {entry.chapter?.wordCount ?? 0} words · submitted
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  color="error"
                  disabled={busy === entry.id}
                  onClick={() => void decide(entry, "reject")}
                >
                  Reject
                </Button>
                <Button
                  color="primary"
                  disabled={busy === entry.id}
                  onClick={() => void decide(entry, "approve")}
                >
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-body text-foreground-dimmed text-sm">
          The queue is clear — nothing to review.
        </p>
      )}
    </section>
  );
};

export namespace ModerationQueue {
  export type Props = {
    items: Moderation.QueueItem[];
  };
}
