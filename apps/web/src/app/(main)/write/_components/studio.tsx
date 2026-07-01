"use client";

import { cn } from "@zenncore/utils";
import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { TextField, TextFieldInput } from "@zenncore/web/components/text-field";
import { useRouter } from "next/navigation";
import { type ReactNode, useRef, useState } from "react";
import {
  ChevronDownIcon,
  CoinIcon,
  PenIcon,
  SparkleIcon,
} from "@/components/icons";
import { Chip } from "@/components/ui";
import * as Chapter from "@/server/app/chapter";
import * as Universe from "@/server/app/universe";
import * as Upload from "@/server/app/upload";
import type { ContinuityFlag } from "@/server/database/schema";

export type StudioGenre = { id: string; name: string };
export type StudioUniverse = { id: string; title: string; slug: string };
export type StudioChapter = { id: string; title: string; depth: number };

// Chapter length guidance (chillpen publishing rules).
const MIN_WORDS = 500; // below this, can't submit for review
const RECOMMENDED_MIN_WORDS = 800; // "ready for review" sweet spot
const RECOMMENDED_MAX_WORDS = 1500;
const WARN_WORDS = 2500; // above this, gently suggest splitting
const MAX_WORDS = 4000; // hard cap — must split before submitting
const DESCRIPTION_LIMIT = 150;
const WORDS_PER_MINUTE = 200;

const TOO_SHORT_MESSAGE =
  "Your chapter is too short to publish. Add more story, dialogue, or detail before submitting.";
const READY_MESSAGE = "Great chapter length. This is ready for review.";
const GETTING_LONG_MESSAGE =
  "This chapter is getting long. Consider splitting it into two parts for better reader experience.";
const TOO_LONG_MESSAGE =
  "Please split this into multiple chapters before submitting.";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const Studio = ({
  genres,
  universes,
  preselectedUniverse,
  preselectedParent,
  preselectedChapters = [],
}: Studio.Props) => {
  const router = useRouter();

  const [mode, setMode] = useState<"continue" | "new">(
    preselectedUniverse || preselectedParent || universes.length > 0
      ? "continue"
      : "new",
  );

  // continue-a-universe state
  const [universe, setUniverse] = useState(preselectedUniverse ?? "");
  const [chapters, setChapters] =
    useState<StudioChapter[]>(preselectedChapters);
  const [parent, setParent] = useState(preselectedParent ?? "");
  const [loadingChapters, setLoadingChapters] = useState(false);

  // new-universe state
  const [universeTitle, setUniverseTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  // shared chapter state
  const [chapterTitle, setChapterTitle] = useState("");
  const [body, setBody] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);

  // AI consistency
  const [flags, setFlags] = useState<ContinuityFlag[] | null>(null);

  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const characters = body.length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

  const lengthState = (() => {
    if (words === 0) return "empty";
    if (words < MIN_WORDS) return "short";
    if (words > MAX_WORDS) return "over";
    if (words > WARN_WORDS) return "warn";
    if (words >= RECOMMENDED_MIN_WORDS) return "great";
    return "ok";
  })();

  const changeUniverse = async (id: string) => {
    setUniverse(id);
    setParent("");
    setFlags(null);
    if (id === preselectedUniverse) {
      setChapters(preselectedChapters);
      return;
    }
    setLoadingChapters(true);
    const result = await Chapter.tree({ universe: id });
    setChapters(
      result.success
        ? result.data.map((node) => ({
            id: node.id,
            title: node.title,
            depth: node.depth,
          }))
        : [],
    );
    setLoadingChapters(false);
  };

  const handleCover = (file: File | undefined) => {
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const [runCheck, isChecking] = useAsyncAction(async () => {
    const result = await Chapter.consistencyPreview({ parent, body });
    if (result.success) setFlags(result.data);
  });

  // Turns a failed publish result into the exact reader-facing copy.
  const publishMessage = (message?: string) => {
    switch (message) {
      case "chapter-too-short":
        return TOO_SHORT_MESSAGE;
      case "chapter-too-long":
        return TOO_LONG_MESSAGE;
      default:
        return null;
    }
  };

  const [run, isPending] = useAsyncAction(
    async (action: "draft" | "submit") => {
      setError(null);

      if (!chapterTitle.trim()) {
        setError("Give your chapter a title.");
        return;
      }

      if (mode === "continue") {
        if (!universe || !parent) {
          setError("Pick a universe and the chapter you're continuing from.");
          return;
        }
        // Publishing for review enforces the 500–4,000 word rule; drafts don't.
        if (action === "submit") {
          if (words < MIN_WORDS) {
            setError(TOO_SHORT_MESSAGE);
            return;
          }
          if (words > MAX_WORDS) {
            setError(TOO_LONG_MESSAGE);
            return;
          }
        }
        const created = await Chapter.fork({
          parent,
          title: chapterTitle,
          body,
          summary: summary || undefined,
        });
        if (!created.success) {
          setError(
            publishMessage(created.error?.message) ??
              "Could not save your chapter. Try again.",
          );
          return;
        }
        // Surface the outcome instead of silently redirecting — this is why
        // "publish for review" appeared to do nothing before.
        if (action === "submit") {
          const submitted = await Chapter.submitForApproval({
            chapter: created.data.id,
          });
          if (!submitted.success) {
            setError(
              publishMessage(submitted.error?.message) ??
                "Saved as a draft, but we couldn't send it for review. Open it from your dashboard to retry.",
            );
            return;
          }
        }
        router.push("/me");
        return;
      }

      // New universe — the author's opening chapter is published directly, so
      // there's no review word-gate; we only need the essentials.
      if (!universeTitle.trim()) {
        setError("Your universe needs a title.");
        return;
      }
      if (selectedGenres.length === 0) {
        setError("Pick at least one genre.");
        return;
      }
      if (words === 0) {
        setError("Write your opening chapter before publishing.");
        return;
      }
      if (words > MAX_WORDS) {
        setError(TOO_LONG_MESSAGE);
        return;
      }

      const cover = await (async () => {
        if (!coverFile) return undefined;
        const formData = new FormData();
        formData.append("file", coverFile);
        const uploaded = await Upload.uploadImage(formData);
        return uploaded.success ? uploaded.data.url : undefined;
      })();

      const created = await Universe.createUniverse({
        title: universeTitle,
        slug: slugify(universeTitle) || `universe-${words}`,
        description: description || undefined,
        cover,
        genres: selectedGenres,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        firstChapter: {
          title: chapterTitle,
          body,
          summary: summary || undefined,
        },
      });
      if (!created.success || !created.data) {
        setError(
          "Could not create the universe. A universe with a similar name may already exist — try a different title.",
        );
        return;
      }
      router.push(`/story/${created.data.slug}`);
    },
  );

  const universeOptions = universes.map((entry) => ({
    value: entry.id,
    label: entry.title,
  }));
  const chapterOptions = chapters.map((node) => ({
    value: node.id,
    label: `${"— ".repeat(node.depth)}${node.title}`,
  }));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <div className="inline-flex rounded-[6px] border border-white/8 bg-background-rich p-1">
          <TabButton
            active={mode === "continue"}
            onClick={() => setMode("continue")}
          >
            <PenIcon className="size-4" />
            Continue a universe
          </TabButton>
          <TabButton active={mode === "new"} onClick={() => setMode("new")}>
            <SparkleIcon className="size-4" />
            Start a new universe
          </TabButton>
        </div>

        {mode === "continue" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Universe">
              <Dropdown
                placeholder="Pick a universe…"
                value={universe}
                options={universeOptions}
                onChange={(id) => void changeUniverse(id)}
              />
            </Field>
            <Field label="Continues from">
              <Dropdown
                placeholder={
                  loadingChapters ? "Loading chapters…" : "— Choose a chapter —"
                }
                value={parent}
                disabled={!universe || loadingChapters}
                options={chapterOptions}
                onChange={setParent}
              />
            </Field>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
              <CoverPicker
                preview={coverPreview}
                onPick={() => coverInput.current?.click()}
              />
              <input
                ref={coverInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleCover(event.target.files?.[0])}
              />
              <div className="space-y-4">
                <Field label="Universe title">
                  <TextField
                    value={universeTitle}
                    onValueChange={setUniverseTitle}
                  >
                    <TextFieldInput placeholder="The name of your world" />
                  </TextField>
                </Field>
                <Field
                  label="Description"
                  hint={`${description.length}/${DESCRIPTION_LIMIT}`}
                >
                  <textarea
                    value={description}
                    maxLength={DESCRIPTION_LIMIT}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={2}
                    placeholder="One vivid line so cards stay clean."
                    className="w-full resize-none rounded-md border border-accent-foreground bg-white/[0.02] px-3 py-2 font-body text-foreground text-sm outline-none transition focus:border-primary/45"
                  />
                </Field>
              </div>
            </div>

            <Field label="Genre">
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() =>
                      setSelectedGenres((current) =>
                        current.includes(genre.id)
                          ? current.filter((id) => id !== genre.id)
                          : [...current, genre.id],
                      )
                    }
                  >
                    <Chip active={selectedGenres.includes(genre.id)}>
                      {genre.name}
                    </Chip>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Tags" hint="comma separated">
              <TextField value={tags} onValueChange={setTags}>
                <TextFieldInput placeholder="space opera, found family, slow burn" />
              </TextField>
            </Field>
          </div>
        )}

        {/* chapter editor / preview */}
        <div className="border-white/8 border-t pt-6">
          {previewing ? (
            <article className="min-h-[320px]">
              <h2 className="font-display font-medium text-2xl text-foreground">
                {chapterTitle || "Untitled chapter"}
              </h2>
              <div className="mt-4 whitespace-pre-wrap font-reading text-foreground-rich text-xl leading-[1.8]">
                {body || "Nothing to preview yet."}
              </div>
            </article>
          ) : (
            <>
              <TextField value={chapterTitle} onValueChange={setChapterTitle}>
                <TextFieldInput
                  placeholder="Chapter title"
                  className="!text-2xl border-0 bg-transparent px-0 font-display font-medium"
                />
              </TextField>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={16}
                placeholder={
                  mode === "continue"
                    ? "Continue where the last chapter left off…"
                    : "Open the world. Use a blank line for a new paragraph."
                }
                className="mt-3 w-full resize-none rounded-[8px] border border-white/8 bg-background-rich p-5 font-reading text-foreground-rich text-xl leading-[1.8] outline-none transition focus:border-primary/30"
              />
              <Field
                label="Chapter summary"
                hint="2–3 sentences for the branch map"
                className="mt-4"
              >
                <textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  rows={2}
                  placeholder="A short hook readers see in the universe map and previews."
                  className="w-full resize-none rounded-md border border-accent-foreground bg-white/[0.02] px-3 py-2 font-body text-foreground text-sm outline-none transition focus:border-primary/45"
                />
              </Field>
            </>
          )}

          {/* length meter */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-subtitle text-foreground-dimmed text-xs">
            <span>
              <span className="font-medium text-foreground">{words}</span> words
            </span>
            <span>
              <span className="font-medium text-foreground">{characters}</span>{" "}
              chars
            </span>
            <span>
              <span className="font-medium text-foreground">{minutes}m</span>{" "}
              read
            </span>
            <span
              className={cn(
                "ml-auto max-w-[60ch] text-right",
                lengthState === "short" && "text-warning",
                lengthState === "over" && "text-error",
                lengthState === "warn" && "text-warning",
                lengthState === "great" && "text-success",
              )}
            >
              {lengthState === "short" && TOO_SHORT_MESSAGE}
              {lengthState === "ok" &&
                `Publishable — aim for ${RECOMMENDED_MIN_WORDS.toLocaleString()}–${RECOMMENDED_MAX_WORDS.toLocaleString()} words for a fuller chapter.`}
              {lengthState === "great" && READY_MESSAGE}
              {lengthState === "warn" && GETTING_LONG_MESSAGE}
              {lengthState === "over" && TOO_LONG_MESSAGE}
              {lengthState === "empty" &&
                `min ${MIN_WORDS} · recommended ${RECOMMENDED_MIN_WORDS.toLocaleString()}–${RECOMMENDED_MAX_WORDS.toLocaleString()} · max ${MAX_WORDS.toLocaleString()}`}
            </span>
          </div>

          {error ? (
            <p className="mt-3 font-subtitle text-error text-sm">{error}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {mode === "continue" ? (
              <>
                <Button
                  color="primary"
                  disabled={isPending}
                  onClick={() => void run("submit")}
                >
                  Submit for review
                </Button>
                <Button
                  variant="outline"
                  color="neutral"
                  disabled={isPending}
                  onClick={() => void run("draft")}
                >
                  Save draft
                </Button>
              </>
            ) : (
              <Button
                color="primary"
                disabled={isPending}
                onClick={() => void run("submit")}
              >
                Publish universe
              </Button>
            )}
            <Button
              variant="ghost"
              color="neutral"
              onClick={() => setPreviewing((current) => !current)}
            >
              {previewing ? "Back to editor" : "Preview"}
            </Button>
          </div>
        </div>
      </div>

      {/* side rail: stats + AI tools + reward */}
      <aside className="space-y-4">
        <div className="rounded-[8px] border border-white/8 bg-background-rich p-4">
          <p className="font-medium font-subtitle text-2xs text-foreground-dimmed uppercase tracking-widest">
            Stats
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Stat value={words} label="words" />
            <Stat value={characters} label="chars" />
            <Stat value={`${minutes}m`} label="read" />
          </div>
        </div>

        <div className="rounded-[8px] border border-primary/20 bg-primary/[0.04] p-4">
          <p className="flex items-center gap-1.5 font-medium font-subtitle text-2xs text-primary uppercase tracking-widest">
            <SparkleIcon className="size-3.5" />
            AI tools
          </p>
          <Button
            color="primary"
            variant="soft"
            disabled={
              mode !== "continue" || !parent || words === 0 || isChecking
            }
            onClick={() => void runCheck()}
            className="mt-3 w-full"
          >
            {isChecking ? "Checking…" : "Run consistency check"}
          </Button>
          <p className="mt-2 font-body text-foreground-dimmed text-xs leading-snug">
            Compares your draft against every approved chapter on this branch
            path. Powered by Claude.
          </p>
          {flags ? (
            <div className="mt-3 space-y-1.5">
              {flags.length === 0 ? (
                <p className="font-subtitle text-success text-xs">
                  No continuity issues found.
                </p>
              ) : (
                flags.map((flag) => (
                  <p
                    key={`${flag.kind}-${flag.message}`}
                    className="rounded border border-warning/30 bg-warning/10 px-2 py-1.5 font-body text-warning text-xs"
                  >
                    <span className="font-medium uppercase">{flag.kind}</span> ·{" "}
                    {flag.message}
                  </p>
                ))
              )}
            </div>
          ) : null}
        </div>

        <div className="rounded-[8px] border border-white/8 bg-background-rich p-4">
          <p className="flex items-center gap-1.5 font-medium font-subtitle text-2xs text-foreground-dimmed uppercase tracking-widest">
            <CoinIcon className="size-3.5 text-primary" />
            Reward
          </p>
          <p className="mt-2 font-body text-foreground-rich text-sm leading-relaxed">
            <span className="font-medium text-primary">+50 coins</span> for
            submitting, <span className="font-medium text-primary">+200</span>{" "}
            if your universe is approved.
          </p>
        </div>
      </aside>
    </div>
  );
};

export namespace Studio {
  export type Props = {
    genres: StudioGenre[];
    universes: StudioUniverse[];
    preselectedUniverse?: string;
    preselectedParent?: string;
    preselectedChapters?: StudioChapter[];
  };
}

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 rounded-[4px] px-3.5 py-2 font-medium font-subtitle text-sm transition",
      active
        ? "bg-white/8 text-foreground"
        : "text-foreground-dimmed hover:text-foreground",
    )}
  >
    {children}
  </button>
);

const Field = ({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) => (
  <div className={cn("block", className)}>
    <span className="mb-1.5 flex items-center justify-between">
      <span className="font-medium font-subtitle text-2xs text-foreground-dimmed uppercase tracking-widest">
        {label}
      </span>
      {hint ? (
        <span className="font-subtitle text-2xs text-foreground-dimmed">
          {hint}
        </span>
      ) : null}
    </span>
    {children}
  </div>
);

const Stat = ({ value, label }: { value: ReactNode; label: string }) => (
  <div className="rounded-md bg-white/[0.03] py-2.5">
    <p className="font-display font-semibold text-foreground text-lg">
      {value}
    </p>
    <p className="font-subtitle text-2xs text-foreground-dimmed">{label}</p>
  </div>
);

const CoverPicker = ({
  preview,
  onPick,
}: {
  preview: string | null;
  onPick: () => void;
}) => (
  <button
    type="button"
    onClick={onPick}
    className="group flex aspect-[2/3] flex-col items-center justify-center gap-2 overflow-hidden rounded-[8px] border border-white/10 border-dashed bg-background-rich text-foreground-dimmed transition hover:border-primary/40 hover:text-primary"
  >
    {preview ? (
      // biome-ignore lint/performance/noImgElement: local object-URL preview, not a remote asset
      <img src={preview} alt="" className="size-full object-cover" />
    ) : (
      <>
        <SparkleIcon className="size-5" />
        <span className="font-subtitle text-2xs uppercase tracking-widest">
          Upload cover
        </span>
      </>
    )}
  </button>
);

type DropdownOption = { value: string; label: string };

const Dropdown = ({
  value,
  placeholder,
  options,
  onChange,
  disabled,
}: {
  value: string;
  placeholder: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-accent-foreground bg-white/[0.02] px-3 text-sm transition hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          className={cn(
            "truncate",
            selected ? "text-foreground" : "text-foreground-dimmed",
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDownIcon className="size-4 shrink-0 text-foreground-dimmed" />
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-white/10 bg-background-rich py-1 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.85)]">
            {options.length === 0 ? (
              <p className="px-3 py-2 font-body text-foreground-dimmed text-sm">
                Nothing here yet.
              </p>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "block w-full truncate px-3 py-2 text-left font-body text-sm transition hover:bg-white/5",
                    option.value === value
                      ? "text-primary"
                      : "text-foreground-rich",
                  )}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
