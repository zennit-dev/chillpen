"use client";

import { cn } from "@zenncore/utils";
import { Button } from "@zenncore/web/components/button";
import { TextField, TextFieldInput } from "@zenncore/web/components/text-field";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resolveMediaUrl } from "@/lib/assets";
import type * as Admin from "@/server/app/admin";
import * as AdminApp from "@/server/app/admin";
import * as UniverseApp from "@/server/app/universe";

type Panel = "edit" | "chapters" | null;

const actionError = (
  fallback: string,
  result: { success: false; error?: { message?: string } },
) => result.error?.message?.trim() || fallback;

export const CatalogManager = ({ stories }: CatalogManager.Props) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState(stories);
  const [featured, setFeatured] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      stories.map((story) => [story.id, story.featuredEnabled]),
    ),
  );
  const [open, setOpen] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [chapters, setChapters] = useState<Admin.CatalogChapter[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editingChapter, setEditingChapter] =
    useState<Admin.CatalogChapter | null>(null);

  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftHook, setDraftHook] = useState("");
  const [draftStatus, setDraftStatus] = useState("published");

  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterSummary, setChapterSummary] = useState("");
  const [chapterBody, setChapterBody] = useState("");
  const [chapterStatus, setChapterStatus] = useState("approved");

  const featuredCount = Object.values(featured).filter(Boolean).length;

  const openEdit = (story: Admin.CatalogStory) => {
    setOpen(story.id);
    setPanel("edit");
    setEditingChapter(null);
    setDraftTitle(story.title);
    setDraftDescription(story.description ?? "");
    setDraftHook(story.featuredHook ?? "");
    setDraftStatus(story.status);
    setToast(null);
  };

  const openChapters = async (story: Admin.CatalogStory) => {
    setOpen(story.id);
    setPanel("chapters");
    setEditingChapter(null);
    setBusy(story.id);
    setToast(null);
    const result = await AdminApp.listChapters({ universe: story.id });
    setBusy(null);
    if (result.success) setChapters(result.data);
    else setToast(actionError("Could not load chapters.", result));
  };

  const closePanel = () => {
    setOpen(null);
    setPanel(null);
    setEditingChapter(null);
  };

  const saveUniverse = (story: Admin.CatalogStory) => {
    setBusy(story.id);
    startTransition(async () => {
      const result = await AdminApp.updateUniverse({
        universe: story.id,
        title: draftTitle,
        description: draftDescription,
        featuredHook: draftHook,
        status: draftStatus,
      });
      setBusy(null);
      if (!result.success) {
        setToast(actionError("Could not save title.", result));
        return;
      }
      setRows((current) =>
        current.map((row) =>
          row.id === story.id
            ? {
                ...row,
                title: draftTitle.trim(),
                description: draftDescription.trim() || null,
                featuredHook: draftHook.trim() || null,
                status: draftStatus,
              }
            : row,
        ),
      );
      setToast(`Saved "${draftTitle.trim()}".`);
      router.refresh();
    });
  };

  const removeUniverse = (story: Admin.CatalogStory) => {
    const confirmed = window.confirm(
      `Delete "${story.title}" permanently?\n\nThis removes the title and every chapter under it. This cannot be undone.`,
    );
    if (!confirmed) return;

    setBusy(story.id);
    startTransition(async () => {
      const result = await AdminApp.deleteUniverse({ universe: story.id });
      setBusy(null);
      if (!result.success) {
        setToast(actionError("Could not delete title.", result));
        return;
      }
      setRows((current) => current.filter((row) => row.id !== story.id));
      closePanel();
      setToast(`Deleted "${story.title}".`);
      router.refresh();
    });
  };

  const toggleFeatured = async (story: Admin.CatalogStory) => {
    const next = !featured[story.id];
    setFeatured((current) => ({ ...current, [story.id]: next }));
    const result = await UniverseApp.toggleFeatured({
      universe: story.id,
      enabled: next,
      order: story.featuredOrder,
      hook: story.featuredHook ?? undefined,
    });
    if (!result.success)
      setFeatured((current) => ({ ...current, [story.id]: !next }));
    else
      setToast(
        next ? `Featured "${story.title}".` : `Unfeatured "${story.title}".`,
      );
  };

  const startChapterEdit = (chapter: Admin.CatalogChapter) => {
    setEditingChapter(chapter);
    setChapterTitle(chapter.title);
    setChapterSummary(chapter.summary ?? "");
    setChapterBody(chapter.body);
    setChapterStatus(chapter.status);
  };

  const saveChapter = () => {
    if (!editingChapter) return;
    setBusy(editingChapter.id);
    startTransition(async () => {
      const result = await AdminApp.updateChapter({
        chapter: editingChapter.id,
        title: chapterTitle,
        body: chapterBody,
        summary: chapterSummary,
        status: chapterStatus,
      });
      setBusy(null);
      if (!result.success) {
        setToast(actionError("Could not save chapter.", result));
        return;
      }
      setChapters((current) =>
        current.map((row) =>
          row.id === editingChapter.id
            ? {
                ...row,
                title: chapterTitle.trim(),
                body: chapterBody.trim(),
                summary: chapterSummary.trim() || null,
                status: chapterStatus,
                wordCount: chapterBody.trim().split(/\s+/).filter(Boolean)
                  .length,
              }
            : row,
        ),
      );
      setEditingChapter(null);
      setToast(`Saved chapter "${chapterTitle.trim()}".`);
      router.refresh();
    });
  };

  const removeChapter = (chapter: Admin.CatalogChapter, storyTitle: string) => {
    const isRoot = chapter.parentChapterId === null;
    const confirmed = window.confirm(
      isRoot
        ? `Delete root chapter "${chapter.title}"?\n\nThis deletes the entire title "${storyTitle}" and all chapters.`
        : `Delete chapter "${chapter.title}" and all branches under it?\n\nThis cannot be undone.`,
    );
    if (!confirmed) return;

    setBusy(chapter.id);
    startTransition(async () => {
      const result = await AdminApp.deleteChapter({ chapter: chapter.id });
      setBusy(null);
      if (!result.success) {
        setToast(actionError("Could not delete chapter.", result));
        return;
      }

      if (isRoot) {
        setRows((current) =>
          current.filter((row) => row.id !== chapter.universeId),
        );
        closePanel();
        setToast(`Deleted title "${storyTitle}" (root chapter removed).`);
      } else {
        const removed =
          result.data && "removed" in result.data
            ? Number(result.data.removed)
            : 1;
        const story = rows.find((row) => row.id === chapter.universeId);
        if (story) void openChapters(story);
        setToast(
          `Deleted chapter "${chapter.title}"${
            removed > 1 ? ` (+${removed - 1} branches)` : ""
          }.`,
        );
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="font-subtitle text-2xs text-primary uppercase tracking-[0.3em]">
          Catalog · Featured on homepage: {featuredCount} / {rows.length}
        </p>
        <p className="font-body text-foreground-dimmed text-sm">
          Open, edit, or delete any title and its chapters.
        </p>
      </div>

      {toast ? (
        <p
          className={cn(
            "font-subtitle text-sm",
            toast.includes("Could not") || toast.includes("Insufficient")
              ? "text-error"
              : "text-emerald-400",
          )}
        >
          {toast}
        </p>
      ) : null}

      <div className="space-y-3">
        {rows.map((story) => {
          const on = featured[story.id] ?? false;
          const active = open === story.id;
          return (
            <article
              key={story.id}
              className="overflow-hidden rounded-[12px] border border-white/8 bg-background-rich"
            >
              <div className="flex flex-wrap gap-4 p-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-background">
                  {story.cover ? (
                    <Image
                      src={resolveMediaUrl(story.cover) ?? story.cover}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display font-semibold text-foreground text-xl">
                      {story.title}
                    </h2>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 font-subtitle text-2xs text-foreground-dimmed uppercase tracking-wider">
                      {story.status}
                    </span>
                    {on ? (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 font-subtitle text-2xs text-primary uppercase tracking-wider">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <p className="font-subtitle text-foreground-dimmed text-xs">
                    by {story.author ?? "—"} · {story.chapterCount} chapters ·{" "}
                    {story.readCount.toLocaleString()} reads · /{story.slug}
                  </p>
                  {story.description ? (
                    <p className="line-clamp-2 font-body text-foreground-muted text-sm">
                      {story.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start">
                  <Link
                    href={`/story/${story.slug}`}
                    className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 font-subtitle text-foreground text-sm transition hover:border-primary hover:text-primary"
                  >
                    Open
                  </Link>
                  <Button
                    variant="outline"
                    disabled={busy === story.id || pending}
                    onClick={() => openEdit(story)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy === story.id || pending}
                    onClick={() => void openChapters(story)}
                  >
                    Chapters
                  </Button>
                  <button
                    type="button"
                    aria-label="Toggle featured"
                    onClick={() => void toggleFeatured(story)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full transition",
                      on
                        ? "bg-primary text-background"
                        : "bg-background/60 text-foreground-dimmed",
                    )}
                  >
                    ★
                  </button>
                  <Button
                    variant="outline"
                    color="error"
                    disabled={busy === story.id || pending}
                    onClick={() => removeUniverse(story)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {active && panel === "edit" ? (
                <div className="space-y-4 border-white/8 border-t bg-background/40 p-4">
                  <p className="font-subtitle text-2xs text-primary uppercase tracking-[0.3em]">
                    Edit title
                  </p>
                  <TextField
                    value={draftTitle}
                    onValueChange={setDraftTitle}
                    className="rounded-md border border-white/10 bg-background px-3"
                  >
                    <TextFieldInput placeholder="Title" />
                  </TextField>
                  <textarea
                    value={draftDescription}
                    onChange={(event) =>
                      setDraftDescription(event.target.value)
                    }
                    placeholder="Description"
                    rows={3}
                    className="w-full rounded-md border border-white/10 bg-background px-3 py-2 font-body text-foreground text-sm outline-none focus:border-primary"
                  />
                  <TextField
                    value={draftHook}
                    onValueChange={setDraftHook}
                    className="rounded-md border border-white/10 bg-background px-3"
                  >
                    <TextFieldInput placeholder="Featured hook (homepage)" />
                  </TextField>
                  <label className="flex flex-col gap-1 font-subtitle text-foreground-dimmed text-xs uppercase tracking-wider">
                    Status
                    <select
                      value={draftStatus}
                      onChange={(event) => setDraftStatus(event.target.value)}
                      className="rounded-md border border-white/10 bg-background px-3 py-2 font-body text-foreground text-sm normal-case tracking-normal outline-none focus:border-primary"
                    >
                      <option value="published">published</option>
                      <option value="submitted">submitted</option>
                      <option value="draft">draft</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      color="primary"
                      disabled={
                        busy === story.id || pending || !draftTitle.trim()
                      }
                      onClick={() => saveUniverse(story)}
                    >
                      Save title
                    </Button>
                    <Button variant="outline" onClick={closePanel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}

              {active && panel === "chapters" ? (
                <div className="space-y-3 border-white/8 border-t bg-background/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-subtitle text-2xs text-primary uppercase tracking-[0.3em]">
                      Chapters ({chapters.length})
                    </p>
                    <Button variant="outline" onClick={closePanel}>
                      Close
                    </Button>
                  </div>

                  {busy === story.id ? (
                    <p className="font-body text-foreground-dimmed text-sm">
                      Loading chapters…
                    </p>
                  ) : chapters.length === 0 ? (
                    <p className="font-body text-foreground-dimmed text-sm">
                      No chapters on this title.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {chapters.map((chapter) => (
                        <div
                          key={chapter.id}
                          className="rounded-[10px] border border-white/8 bg-background-rich p-3"
                          style={{
                            marginLeft: Math.min(chapter.depth, 6) * 12,
                          }}
                        >
                          {editingChapter?.id === chapter.id ? (
                            <div className="space-y-3">
                              <TextField
                                value={chapterTitle}
                                onValueChange={setChapterTitle}
                                className="rounded-md border border-white/10 bg-background px-3"
                              >
                                <TextFieldInput placeholder="Chapter title" />
                              </TextField>
                              <textarea
                                value={chapterSummary}
                                onChange={(event) =>
                                  setChapterSummary(event.target.value)
                                }
                                placeholder="Summary"
                                rows={2}
                                className="w-full rounded-md border border-white/10 bg-background px-3 py-2 font-body text-foreground text-sm outline-none focus:border-primary"
                              />
                              <textarea
                                value={chapterBody}
                                onChange={(event) =>
                                  setChapterBody(event.target.value)
                                }
                                placeholder="Chapter body"
                                rows={10}
                                className="w-full rounded-md border border-white/10 bg-background px-3 py-2 font-body text-foreground text-sm leading-relaxed outline-none focus:border-primary"
                              />
                              <label className="flex flex-col gap-1 font-subtitle text-foreground-dimmed text-xs uppercase tracking-wider">
                                Status
                                <select
                                  value={chapterStatus}
                                  onChange={(event) =>
                                    setChapterStatus(event.target.value)
                                  }
                                  className="rounded-md border border-white/10 bg-background px-3 py-2 font-body text-foreground text-sm normal-case tracking-normal outline-none focus:border-primary"
                                >
                                  <option value="approved">approved</option>
                                  <option value="submitted">submitted</option>
                                  <option value="draft">draft</option>
                                  <option value="rejected">rejected</option>
                                </select>
                              </label>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  color="primary"
                                  disabled={
                                    busy === chapter.id ||
                                    pending ||
                                    !chapterTitle.trim() ||
                                    !chapterBody.trim()
                                  }
                                  onClick={saveChapter}
                                >
                                  Save chapter
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingChapter(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-start gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="font-display font-medium text-foreground">
                                  {chapter.parentChapterId === null
                                    ? "Root · "
                                    : ""}
                                  {chapter.title}
                                </p>
                                <p className="font-subtitle text-foreground-dimmed text-xs">
                                  depth {chapter.depth} ·{" "}
                                  {chapter.authorName ?? "—"} ·{" "}
                                  {chapter.wordCount} words · {chapter.status}
                                </p>
                                {chapter.summary ? (
                                  <p className="mt-1 line-clamp-2 font-body text-foreground-muted text-sm italic">
                                    {chapter.summary}
                                  </p>
                                ) : null}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {story.rootChapterId || chapter.id ? (
                                  <Link
                                    href={`/story/${story.slug}/read/${chapter.id}`}
                                    className="inline-flex items-center justify-center rounded-full border border-white/15 px-3 py-1.5 font-subtitle text-foreground text-xs transition hover:border-primary hover:text-primary"
                                  >
                                    Open
                                  </Link>
                                ) : null}
                                <Button
                                  variant="outline"
                                  disabled={busy === chapter.id || pending}
                                  onClick={() => startChapterEdit(chapter)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  color="error"
                                  disabled={busy === chapter.id || pending}
                                  onClick={() =>
                                    removeChapter(chapter, story.title)
                                  }
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <p className="py-16 text-center font-body text-foreground-dimmed">
          No titles in the catalog yet.
        </p>
      ) : null}
    </div>
  );
};

export namespace CatalogManager {
  export type Props = {
    stories: Admin.CatalogStory[];
  };
}
