"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { useState } from "react";
import { PenIcon } from "@/components/icons";
import * as User from "@/server/app/user";

const LIMIT = 280;

export const BioEditor = ({ initial }: BioEditor.Props) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);
  const [bio, setBio] = useState(initial);

  const [save, isPending] = useAsyncAction(async () => {
    const next = draft.trim();
    const result = await User.updateAvatar({ bio: next });
    if (!result.success) return;
    setBio(next);
    setEditing(false);
  });

  if (!editing)
    return (
      <p className="mt-0.5 flex max-w-md items-start gap-1.5 font-body text-foreground-dimmed text-sm">
        <span>
          {bio || "Add a bio so readers know who's behind the worlds."}
        </span>
        <button
          type="button"
          aria-label="Edit bio"
          onClick={() => setEditing(true)}
          className="shrink-0 text-foreground-dimmed transition hover:text-primary"
        >
          <PenIcon className="size-3.5" />
        </button>
      </p>
    );

  return (
    <div className="mt-1 max-w-md">
      <textarea
        value={draft}
        maxLength={LIMIT}
        rows={2}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Introduce yourself to readers…"
        className="w-full resize-none rounded-md border border-accent-foreground bg-white/[0.02] px-3 py-2 font-body text-foreground text-sm outline-none transition focus:border-primary/45"
      />
      <div className="mt-1.5 flex items-center gap-2">
        <Button color="primary" disabled={isPending} onClick={() => void save()}>
          Save bio
        </Button>
        <button
          type="button"
          onClick={() => {
            setDraft(bio);
            setEditing(false);
          }}
          className="font-subtitle text-foreground-dimmed text-sm transition hover:text-foreground"
        >
          Cancel
        </button>
        <span className="ml-auto font-subtitle text-2xs text-foreground-dimmed">
          {draft.length}/{LIMIT}
        </span>
      </div>
    </div>
  );
};

export namespace BioEditor {
  export type Props = {
    initial: string;
  };
}
