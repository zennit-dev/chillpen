import { resultify } from "@zenncore/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { CoinIcon, PenIcon } from "@/components/icons";
import { StoryCard } from "@/components/story-card";
import { formatCount, SectionHeader } from "@/components/ui";
import * as Authentication from "@/server/app/authentication";
import * as Chapter from "@/server/app/chapter";
import * as ReadPath from "@/server/app/read-path";
import * as Save from "@/server/app/save";
import * as Universe from "@/server/app/universe";
import { Environment } from "@/server/utils/environment";
import { BioEditor } from "./_components/bio-editor";

export const metadata = { title: "Dashboard" };

const statusTone = {
  draft: "text-foreground-dimmed",
  submitted: "text-primary",
  approved: "text-success",
  rejected: "text-error",
} as const;

export default async () => {
  const proxied = await resultify(() =>
    Authentication.getProxiedCurrentUser(Environment.SERVER),
  );
  const user =
    proxied.success && proxied.data.success ? proxied.data.data : null;
  if (!user) redirect("/sign-in");

  const [resume, drafts, universes, savedIds] = await Promise.all([
    resultify(() => ReadPath.resume(Environment.SERVER)),
    resultify(() => Chapter.drafts(Environment.SERVER)),
    Universe.byAuthor(Environment.SERVER, user.id),
    resultify(() => Save.savedUniverseIds(Environment.SERVER)),
  ]);

  const continueCards =
    resume.success && resume.data.success
      ? resume.data.data.flatMap((entry) =>
          entry.universe
            ? [{ ...entry.universe, author: null, genreNames: [] }]
            : [],
        )
      : [];
  const myDrafts =
    drafts.success && drafts.data.success ? drafts.data.data : [];
  const myUniverses = universes.success ? universes.data : [];

  const savedTargets =
    savedIds.success && savedIds.data.success ? savedIds.data.data : [];
  const saved = await Universe.byIds(Environment.SERVER, savedTargets);
  const savedCards = (saved.success ? saved.data : []).slice(0, 5);

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* profile header */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/8 bg-background-rich p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <Avatar
              preset={user.avatarConfig?.preset}
              image={user.image}
              name={user.pseudonym ?? user.name}
              className="size-16 text-2xl ring-2 ring-white/10"
            />
            <div>
              <p className="font-subtitle text-2xs text-foreground-dimmed uppercase tracking-widest">
                Welcome back
              </p>
              <h1 className="font-display font-semibold text-2xl text-foreground">
                {user.pseudonym ?? user.name}
              </h1>
              <BioEditor initial={user.bio ?? ""} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-medium font-subtitle text-primary text-sm">
              <CoinIcon className="size-4" />
              {formatCount(user.coins)}
            </span>
            {user.role === "admin" ? (
              <Link
                href="/admin"
                className="rounded-[4px] border border-primary/40 bg-primary/10 px-4 py-2 font-medium font-subtitle text-primary text-sm transition hover:bg-primary/15"
              >
                Admin panel
              </Link>
            ) : null}
            {user.pseudonym ? (
              <Link
                href={`/u/${user.pseudonym}`}
                className="rounded-[4px] border border-white/12 px-4 py-2 font-medium font-subtitle text-foreground text-sm transition hover:border-primary/40"
              >
                Public profile
              </Link>
            ) : null}
            <Link
              href="/write"
              className="inline-flex items-center gap-1.5 rounded-[4px] bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:bg-primary-rich"
            >
              <PenIcon className="size-4" />
              Write
            </Link>
          </div>
        </header>

        {continueCards.length > 0 ? (
          <section className="mb-10">
            <SectionHeader title="Continue Reading" className="mb-3" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {continueCards.map((universe) => (
                <StoryCard key={universe.id} universe={universe} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mb-10">
          <SectionHeader title="My chapters" href="/write" className="mb-3" />
          {myDrafts.length > 0 ? (
            <div className="space-y-2">
              {myDrafts.map((draft) => (
                <Link
                  key={draft.id}
                  href={`/write/${draft.id}`}
                  className="flex items-center justify-between gap-4 rounded-[6px] border border-white/8 bg-background-rich p-4 transition hover:border-primary/30"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display font-medium text-foreground">
                      {draft.title || "Untitled chapter"}
                    </p>
                    <p className="font-subtitle text-foreground-dimmed text-xs">
                      {draft.wordCount} words
                    </p>
                  </div>
                  <span
                    className={`font-subtitle text-2xs uppercase tracking-wider ${statusTone[draft.status as keyof typeof statusTone] ?? "text-foreground-dimmed"}`}
                  >
                    {draft.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="font-body text-foreground-dimmed text-sm">
              No chapters yet. Start writing to see them here.
            </p>
          )}
        </section>

        <section className="mb-10">
          <SectionHeader title="My universes" className="mb-3" />
          {myUniverses.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {myUniverses.map((universe) => (
                <StoryCard key={universe.id} universe={universe} />
              ))}
            </div>
          ) : (
            <p className="font-body text-foreground-dimmed text-sm">
              You haven't started a universe yet.
            </p>
          )}
        </section>

        <section>
          <SectionHeader
            title="Saved library"
            href="/library"
            className="mb-3"
          />
          {savedCards.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {savedCards.map((universe) => (
                <StoryCard key={universe.id} universe={universe} saved />
              ))}
            </div>
          ) : (
            <p className="font-body text-foreground-dimmed text-sm">
              Nothing saved yet. Tap the save button on any cover.
            </p>
          )}
        </section>
      </div>
    </main>
  );
};
