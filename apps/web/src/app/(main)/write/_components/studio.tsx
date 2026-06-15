"use client";

import { cn } from "@zenncore/utils";
import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { TextField, TextFieldInput } from "@zenncore/web/components/text-field";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SparkleIcon } from "@/components/icons";
import { Chip } from "@/components/ui";
import * as Chapter from "@/server/app/chapter";
import * as Universe from "@/server/app/universe";

export type StudioGenre = { id: string; name: string };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const Studio = ({
  parent,
  universe: _universe,
  genres,
}: Studio.Props) => {
  const router = useRouter();
  const isFork = Boolean(parent);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const characters = body.length;

  const [run, isPending] = useAsyncAction(async (mode: "draft" | "submit") => {
    setError(null);
    if (!title.trim() || !body.trim()) {
      setError("Give your chapter a title and some words.");
      return;
    }

    if (isFork && parent) {
      const created = await Chapter.fork({ parent, title, body });
      if (!created.success) {
        setError("Could not save your chapter.");
        return;
      }
      if (mode === "submit")
        await Chapter.submitForApproval({ chapter: created.data.id });
      router.push("/me");
      return;
    }

    const created = await Universe.createUniverse({
      title,
      slug: slugify(title) || `universe-${Date.now()}`,
      genres: selected,
      firstChapter: { title, body },
    });
    if (!created.success || !created.data) {
      setError("Could not create the universe.");
      return;
    }
    router.push(`/story/${created.data.slug}`);
  });

  return (
    <div className="space-y-6">
      {!isFork ? (
        <div>
          <p className="mb-2 font-subtitle text-2xs text-foreground-dimmed uppercase tracking-widest">
            Genres
          </p>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                onClick={() =>
                  setSelected((current) =>
                    current.includes(genre.id)
                      ? current.filter((id) => id !== genre.id)
                      : [...current, genre.id],
                  )
                }
              >
                <Chip active={selected.includes(genre.id)}>{genre.name}</Chip>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <TextField value={title} onValueChange={setTitle}>
        <TextFieldInput
          placeholder="Chapter title"
          className="!text-2xl border-0 bg-transparent px-0 font-display font-medium"
        />
      </TextField>

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={16}
        placeholder="Begin where the last chapter left off…"
        className="w-full resize-none rounded-[8px] border border-white/8 bg-background-rich p-5 font-reading text-foreground-rich text-xl leading-[1.8] outline-none transition focus:border-primary/30"
      />

      <div className="flex flex-wrap items-center justify-between gap-4 border-white/8 border-t pt-4">
        <p className="font-subtitle text-foreground-dimmed text-xs">
          {words} words · {characters} characters · drafts autosave on save
        </p>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1 font-subtitle text-2xs text-foreground-dimmed sm:flex">
            <SparkleIcon className="size-3.5 text-primary" />
            AI consistency check on submit
          </span>
          <Button
            variant="outline"
            color="neutral"
            disabled={isPending}
            onClick={() => void run("draft")}
          >
            Save draft
          </Button>
          <Button
            color="primary"
            disabled={isPending}
            onClick={() => void run("submit")}
          >
            {isFork ? "Submit for approval" : "Publish universe"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className={cn("font-subtitle text-error text-sm")}>{error}</p>
      ) : null}
    </div>
  );
};

export namespace Studio {
  export type Props = {
    parent?: string;
    universe?: string;
    genres: StudioGenre[];
  };
}
