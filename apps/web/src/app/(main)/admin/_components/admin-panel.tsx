"use client";

import { cn } from "@zenncore/utils";
import { Button } from "@zenncore/web/components/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type * as Admin from "@/server/app/admin";
import * as AdminApp from "@/server/app/admin";
import * as Chapter from "@/server/app/chapter";
import { CatalogManager } from "./catalog-manager";

type Tab = "universes" | "chapters" | "stories" | "writers";

export const AdminPanel = ({
  buildLabel,
  stats,
  pendingUniverses,
  pendingChapters,
  catalog,
  writers,
}: AdminPanel.Props) => {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("stories");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [universeRows, setUniverseRows] = useState(pendingUniverses);
  const [chapterRows, setChapterRows] = useState(pendingChapters);

  const pendingUniversesCount = universeRows.length;
  const pendingChaptersCount = chapterRows.length;

  const tabs: { id: Tab; label: string }[] = [
    {
      id: "universes",
      label: `Pending universes (${pendingUniversesCount})`,
    },
    { id: "chapters", label: `Pending chapters (${pendingChaptersCount})` },
    { id: "stories", label: `Catalog (${catalog.length})` },
    { id: "writers", label: "Top writers" },
  ];

  const statCards = [
    { icon: "👥", value: stats.users, label: "Users" },
    { icon: "📖", value: stats.stories, label: "Stories" },
    { icon: "✦", value: stats.approvedChapters, label: "Approved" },
    { icon: "⏳", value: stats.pendingReviews, label: "Pending" },
    { icon: "€", value: "€16", label: "MRR (est.)" },
    { icon: "📈", value: stats.trialUsers, label: "Trial users" },
  ];

  const approveUniverse = async (id: string, title: string) => {
    setBusy(id);
    const result = await AdminApp.approveUniverse({ universe: id });
    setBusy(null);
    if (result.success) {
      setUniverseRows((current) => current.filter((row) => row.id !== id));
      setToast(`Approved "${title}" — published.`);
      router.refresh();
    }
  };

  const rejectUniverse = async (id: string, title: string) => {
    setBusy(id);
    const result = await AdminApp.rejectUniverse({
      universe: id,
      reason: "Does not meet community guidelines.",
    });
    setBusy(null);
    if (result.success) {
      setUniverseRows((current) => current.filter((row) => row.id !== id));
      setToast(`Rejected "${title}".`);
      router.refresh();
    }
  };

  const decideChapter = async (
    entry: Admin.QueueEntry,
    action: "approve" | "reject",
  ) => {
    setBusy(entry.id);
    const result =
      action === "approve"
        ? await Chapter.approve({ chapter: entry.id })
        : await Chapter.reject({
            chapter: entry.id,
            reason: "Does not meet community guidelines.",
          });
    setBusy(null);
    if (result.success) {
      setChapterRows((current) => current.filter((row) => row.id !== entry.id));
      setToast(
        action === "approve"
          ? `Approved "${entry.title}" — published.`
          : `Rejected "${entry.title}".`,
      );
      router.refresh();
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-subtitle text-2xs text-primary uppercase tracking-[0.35em]">
            Control room
          </p>
          <h1 className="mt-1 font-display font-semibold text-4xl text-foreground tracking-tight sm:text-5xl">
            Admin
          </h1>
          <p className="mt-2 max-w-xl font-body text-foreground-muted text-sm">
            Catalog tab: <strong className="text-foreground">Open</strong>,{" "}
            <strong className="text-foreground">Edit</strong> (text + cover
            photo), <strong className="text-foreground">Chapters</strong>, and{" "}
            <strong className="text-foreground">Delete</strong> on every title.
            Build <span className="font-mono text-primary">{buildLabel}</span>
            {" — "}
            if you only see cover cards with a star, production has not deployed
            this version yet.
          </p>
        </div>
        <Link
          href="/write"
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-medium font-subtitle text-background text-sm transition hover:bg-primary-rich"
        >
          Add new book
        </Link>
      </header>

      {toast ? (
        <p className="font-subtitle text-emerald-400 text-sm">{toast}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[14px] border border-white/7 bg-background-rich p-5"
          >
            <span className="text-lg">{card.icon}</span>
            <p className="mt-2 font-display font-semibold text-3xl text-foreground">
              {card.value}
            </p>
            <p className="mt-1 font-subtitle text-2xs text-foreground-dimmed uppercase tracking-widest">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-7 border-white/8 border-b">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              setToast(null);
            }}
            className={cn(
              "border-transparent border-b-2 bg-transparent pb-3.5 font-subtitle font-medium text-base transition",
              tab === item.id
                ? "border-foreground text-foreground"
                : "text-foreground-dimmed hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "universes" ? (
        universeRows.length > 0 ? (
          <div className="space-y-2.5">
            {universeRows.map((entry) => (
              <article
                key={entry.id}
                className="rounded-[10px] border border-white/8 bg-background-rich p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-medium text-foreground">
                      {entry.title}
                    </p>
                    <p className="font-subtitle text-foreground-dimmed text-xs">
                      new universe · by {entry.author ?? "—"} ·{" "}
                      {entry.wordCount} words
                    </p>
                  </div>
                  <span className="font-subtitle text-2xs text-primary uppercase tracking-wider">
                    {entry.status}
                  </span>
                  <Button
                    color="primary"
                    disabled={busy === entry.id}
                    onClick={() => void approveUniverse(entry.id, entry.title)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    color="error"
                    disabled={busy === entry.id}
                    onClick={() => void rejectUniverse(entry.id, entry.title)}
                  >
                    Reject
                  </Button>
                </div>
                <p className="mt-2 line-clamp-2 font-body text-foreground-muted text-base italic leading-relaxed">
                  {entry.excerpt}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="py-20 text-center font-body text-foreground-dimmed">
            No universe proposals waiting.
          </p>
        )
      ) : null}

      {tab === "chapters" ? (
        chapterRows.length > 0 ? (
          <div className="space-y-2.5">
            {chapterRows.map((entry) => (
              <article
                key={entry.id}
                className="rounded-[10px] border border-white/8 bg-background-rich p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-medium text-foreground">
                      {entry.title}
                    </p>
                    <p className="font-subtitle text-foreground-dimmed text-xs">
                      by {entry.authorName ?? "—"} ·{" "}
                      {entry.universeTitle ?? "—"} · {entry.wordCount} words
                    </p>
                  </div>
                  <Button
                    color="primary"
                    disabled={busy === entry.id}
                    onClick={() => void decideChapter(entry, "approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    color="error"
                    disabled={busy === entry.id}
                    onClick={() => void decideChapter(entry, "reject")}
                  >
                    Reject
                  </Button>
                </div>
                <p className="mt-2 line-clamp-2 font-body text-foreground-muted text-base italic leading-relaxed">
                  {entry.summary ?? entry.body}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="py-20 text-center font-body text-foreground-dimmed">
            No chapters waiting for review.
          </p>
        )
      ) : null}

      {tab === "stories" ? <CatalogManager stories={catalog} /> : null}

      {tab === "writers" ? (
        <div className="overflow-hidden rounded-[12px] border border-white/8">
          <div className="grid grid-cols-[60px_1fr_120px_120px_100px] bg-background-rich px-5 py-3.5 font-subtitle text-2xs text-foreground-dimmed uppercase tracking-widest">
            <span>#</span>
            <span>Writer</span>
            <span>Chapters</span>
            <span>Reads</span>
            <span>Likes</span>
          </div>
          {writers.map((writer) => (
            <div
              key={writer.pseudonym}
              className="grid grid-cols-[60px_1fr_120px_120px_100px] items-center border-white/6 border-t bg-background px-5 py-4 font-body text-foreground text-sm"
            >
              <span className="text-foreground-dimmed">{writer.rank}</span>
              <Link
                href={`/u/${writer.pseudonym}`}
                className="font-display font-medium hover:text-primary"
              >
                {writer.pseudonym}
              </Link>
              <span>{writer.chapters}</span>
              <span>{writer.reads.toLocaleString()}</span>
              <span className="text-primary">
                {writer.likes.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export namespace AdminPanel {
  export type Props = {
    buildLabel: string;
    stats: Admin.DashboardStats;
    pendingUniverses: Admin.PendingUniverse[];
    pendingChapters: Admin.QueueEntry[];
    catalog: Admin.CatalogStory[];
    writers: {
      rank: number;
      pseudonym: string;
      chapters: number;
      reads: number;
      likes: number;
    }[];
  };
}
