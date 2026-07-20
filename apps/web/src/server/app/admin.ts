"use server";

import { and, eq, inArray, isNull, ne, or } from "drizzle-orm";
import { unique } from "@/utils/array";
import { schema, type TransactionScope, withTransaction } from "../database";
import { withAuthorization } from "../utils/authorization";
import { Environment } from "../utils/environment";
import { repository } from "../utils/repository";
import * as Chapter from "./chapter";
import * as Coin from "./coin";
import * as Universe from "./universe";
import * as User from "./user";

const queue = repository(schema.moderationQueue);

export type DashboardStats = {
  users: number;
  stories: number;
  approvedChapters: number;
  pendingReviews: number;
  trialUsers: number;
};

export type PendingUniverse = {
  id: string;
  title: string;
  author: string | null;
  wordCount: number;
  excerpt: string;
  status: string;
};

export type QueueEntry = Chapter.Type & {
  universeTitle: string | null;
  authorName: string | null;
  queueId: string;
};

export const dashboard = withAuthorization(
  ["admin"],
  async () => {
    const [users, stories, approved, pending, trials] = await Promise.all([
      User.count(Environment.SERVER),
      Universe.count(
        Environment.SERVER,
        eq(schema.universe.status, "published"),
      ),
      Chapter.count(Environment.SERVER, eq(schema.chapter.status, "approved")),
      queue.count(
        Environment.SERVER,
        eq(schema.moderationQueue.status, "pending"),
      ),
      User.count(
        Environment.SERVER,
        eq(schema.user.subscriptionStatus, "trial"),
      ),
    ]);

    if (!users.success) return users;
    if (!stories.success) return stories;
    if (!approved.success) return approved;
    if (!pending.success) return pending;
    if (!trials.success) return trials;

    return {
      success: true as const,
      data: {
        users: users.data,
        stories: stories.data,
        approvedChapters: approved.data,
        pendingReviews: pending.data,
        trialUsers: trials.data,
      } satisfies DashboardStats,
    };
  },
  "Admin.dashboard",
);

export const pendingUniverses = withAuthorization(
  ["admin"],
  async () => {
    const universes = await Universe.find(Environment.SERVER, {
      where: eq(schema.universe.status, "submitted"),
      orderBy: [{ column: schema.universe.createdAt, direction: "asc" }],
    });
    if (!universes.success) return universes;

    const rootIds = universes.data
      .map((entry) => entry.rootChapterId)
      .filter((id): id is string => Boolean(id));

    const roots =
      rootIds.length > 0
        ? await Chapter.find(Environment.SERVER, {
            where: inArray(schema.chapter.id, rootIds),
          })
        : { success: true as const, data: [] as Chapter.Type[] };

    const authorIds = unique(
      universes.data.map((entry) => entry.originatingAuthorId),
    );
    const authors = await User.find(Environment.SERVER, {
      where: inArray(schema.user.id, authorIds),
    });

    const rootMap = roots.success
      ? new Map(roots.data.map((chapter) => [chapter.id, chapter]))
      : new Map<string, Chapter.Type>();
    const authorMap = authors.success
      ? new Map(
          authors.data.map((author) => [
            author.id,
            author.pseudonym ?? author.name,
          ]),
        )
      : new Map<string, string>();

    return {
      success: true as const,
      data: universes.data.map((entry): PendingUniverse => {
        const root = entry.rootChapterId
          ? rootMap.get(entry.rootChapterId)
          : null;
        return {
          id: entry.id,
          title: entry.title,
          author: authorMap.get(entry.originatingAuthorId) ?? null,
          wordCount: root?.wordCount ?? 0,
          excerpt: root?.summary ?? root?.body.slice(0, 200) ?? "",
          status: entry.status,
        };
      }),
    };
  },
  "Admin.pendingUniverses",
);

export const pendingChapters = withAuthorization(
  ["admin"],
  async () => {
    const entries = await queue.find(Environment.SERVER, {
      where: eq(schema.moderationQueue.status, "pending"),
      orderBy: [{ column: schema.moderationQueue.createdAt, direction: "asc" }],
    });
    if (!entries.success) return entries;
    if (entries.data.length === 0)
      return { success: true as const, data: [] as QueueEntry[] };

    const chapterIds = unique(entries.data.map((entry) => entry.chapterId));
    const chapters = await Chapter.find(Environment.SERVER, {
      where: inArray(schema.chapter.id, chapterIds),
    });
    if (!chapters.success) return chapters;

    const continuationChapters = chapters.data.filter(
      (chapter) => chapter.parentChapterId !== null,
    );
    if (continuationChapters.length === 0)
      return { success: true as const, data: [] as QueueEntry[] };

    const universeIds = unique(
      continuationChapters.map((chapter) => chapter.universeId),
    );
    const authorIds = unique(
      continuationChapters.map((chapter) => chapter.authorId),
    );

    const [universes, authors] = await Promise.all([
      Universe.find(Environment.SERVER, {
        where: inArray(schema.universe.id, universeIds),
      }),
      User.find(Environment.SERVER, {
        where: inArray(schema.user.id, authorIds),
      }),
    ]);

    const universeMap = universes.success
      ? new Map(universes.data.map((entry) => [entry.id, entry.title]))
      : new Map<string, string>();
    const authorMap = authors.success
      ? new Map(
          authors.data.map((author) => [
            author.id,
            author.pseudonym ?? author.name,
          ]),
        )
      : new Map<string, string>();
    const queueMap = new Map(
      entries.data.map((entry) => [entry.chapterId, entry.id]),
    );

    return {
      success: true as const,
      data: continuationChapters.map(
        (chapter): QueueEntry => ({
          ...chapter,
          universeTitle: universeMap.get(chapter.universeId) ?? null,
          authorName: authorMap.get(chapter.authorId) ?? null,
          queueId: queueMap.get(chapter.id) ?? "",
        }),
      ),
    };
  },
  "Admin.pendingChapters",
);

export const listStories = withAuthorization(
  ["admin"],
  async () => Universe.listPublished(Environment.SERVER, { size: 100 }),
  "Admin.listStories",
);

/** Full catalog for the admin control room — every status, not just published. */
export const listCatalog = withAuthorization(
  ["admin"],
  async () => {
    const universes = await Universe.find(Environment.SERVER, {
      orderBy: [{ column: schema.universe.updatedAt, direction: "desc" }],
      limit: 200,
    });
    if (!universes.success) return universes;

    const authorIds = unique(
      universes.data.map((entry) => entry.originatingAuthorId),
    );
    const authors =
      authorIds.length > 0
        ? await User.find(Environment.SERVER, {
            where: inArray(schema.user.id, authorIds),
          })
        : { success: true as const, data: [] as User.Type[] };

    const authorMap = authors.success
      ? new Map(
          authors.data.map((author) => [
            author.id,
            author.pseudonym ?? author.name,
          ]),
        )
      : new Map<string, string>();

    return {
      success: true as const,
      data: universes.data.map(
        (entry): CatalogStory => ({
          id: entry.id,
          slug: entry.slug,
          title: entry.title,
          description: entry.description,
          cover: entry.cover,
          status: entry.status,
          author: authorMap.get(entry.originatingAuthorId) ?? null,
          chapterCount: entry.chapterCount,
          readCount: entry.readCount,
          featuredEnabled: entry.featuredEnabled,
          featuredOrder: entry.featuredOrder,
          featuredHook: entry.featuredHook,
          rootChapterId: entry.rootChapterId,
        }),
      ),
    };
  },
  "Admin.listCatalog",
);

export type CatalogStory = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover: string | null;
  status: string;
  author: string | null;
  chapterCount: number;
  readCount: number;
  featuredEnabled: boolean;
  featuredOrder: number;
  featuredHook: string | null;
  rootChapterId: string | null;
};

export type CatalogChapter = {
  id: string;
  universeId: string;
  parentChapterId: string | null;
  title: string;
  summary: string | null;
  body: string;
  depth: number;
  wordCount: number;
  status: string;
  authorName: string | null;
};

export const listChapters = withAuthorization(
  ["admin"],
  async (_context, { universe }: { universe: string }) => {
    const chapters = await Chapter.find(Environment.SERVER, {
      where: eq(schema.chapter.universeId, universe),
      orderBy: [
        { column: schema.chapter.depth, direction: "asc" },
        { column: schema.chapter.createdAt, direction: "asc" },
      ],
    });
    if (!chapters.success) return chapters;

    const authorIds = unique(chapters.data.map((entry) => entry.authorId));
    const authors =
      authorIds.length > 0
        ? await User.find(Environment.SERVER, {
            where: inArray(schema.user.id, authorIds),
          })
        : { success: true as const, data: [] as User.Type[] };

    const authorMap = authors.success
      ? new Map(
          authors.data.map((author) => [
            author.id,
            author.pseudonym ?? author.name,
          ]),
        )
      : new Map<string, string>();

    return {
      success: true as const,
      data: chapters.data.map(
        (entry): CatalogChapter => ({
          id: entry.id,
          universeId: entry.universeId,
          parentChapterId: entry.parentChapterId,
          title: entry.title,
          summary: entry.summary,
          body: entry.body,
          depth: entry.depth,
          wordCount: entry.wordCount,
          status: entry.status,
          authorName: authorMap.get(entry.authorId) ?? null,
        }),
      ),
    };
  },
  "Admin.listChapters",
);

export const updateUniverse = withAuthorization(
  ["admin"],
  async (
    _context,
    input: {
      universe: string;
      title: string;
      description?: string;
      featuredHook?: string;
      status?: string;
      cover?: string;
    },
  ) => {
    const title = input.title.trim();
    if (!title)
      return {
        success: false as const,
        error: new Error("title-required"),
      };

    return Universe.update(Environment.SERVER, input.universe, {
      title,
      description: input.description?.trim() || null,
      featuredHook: input.featuredHook?.trim() || null,
      ...(input.status ? { status: input.status } : {}),
      ...(input.cover !== undefined ? { cover: input.cover || null } : {}),
      updatedAt: new Date(),
    });
  },
  "Admin.updateUniverse",
);

export const deleteUniverse = withAuthorization(
  ["admin"],
  async (_context, { universe: id }: { universe: string }) => {
    const entry = await Universe.get(Environment.SERVER, id);
    if (!entry.success) return entry;
    if (!entry.data)
      return {
        success: false as const,
        error: new Error("universe-not-found"),
      };

    const title = entry.data.title;

    return withTransaction(async (tx: TransactionScope) => {
      // Saves point at the universe by opaque targetId (no FK) — clear them.
      await tx.delete(schema.save).where(eq(schema.save.targetId, id));

      // Break the soft root pointer before chapters cascade away.
      await Universe.update(
        Environment.SERVER,
        id,
        { rootChapterId: null },
        { tx },
      );

      // Self-referential parentChapterId can block a single CASCADE wipe —
      // null parents first, then delete chapters, then the universe.
      const chapters = await Chapter.find(
        Environment.SERVER,
        { where: eq(schema.chapter.universeId, id) },
        { tx },
      );
      if (chapters.success && chapters.data.length > 0) {
        const chapterIds = chapters.data.map((chapter) => chapter.id);
        await tx
          .update(schema.chapter)
          .set({ parentChapterId: null })
          .where(inArray(schema.chapter.id, chapterIds));
        await tx
          .delete(schema.chapter)
          .where(inArray(schema.chapter.id, chapterIds));
      }

      const removed = await Universe.destroy(Environment.SERVER, id, { tx });
      if (!removed.success) return removed;
      return { success: true as const, data: { id, title } };
    });
  },
  "Admin.deleteUniverse",
);

export const updateChapter = withAuthorization(
  ["admin"],
  async (
    _context,
    input: {
      chapter: string;
      title: string;
      body: string;
      summary?: string;
      status?: string;
    },
  ) => {
    const title = input.title.trim();
    const body = input.body.trim();
    if (!title)
      return {
        success: false as const,
        error: new Error("title-required"),
      };
    if (!body)
      return {
        success: false as const,
        error: new Error("body-required"),
      };

    const wordCount = body.split(/\s+/).filter(Boolean).length;

    return Chapter.update(Environment.SERVER, input.chapter, {
      title,
      body,
      summary: input.summary?.trim() || null,
      wordCount,
      ...(input.status ? { status: input.status } : {}),
      updatedAt: new Date(),
    });
  },
  "Admin.updateChapter",
);

const collectDescendants = (
  root: string,
  chapters: Chapter.Type[],
): string[] => {
  const children = new Map<string, string[]>();
  for (const chapter of chapters) {
    if (!chapter.parentChapterId) continue;
    const siblings = children.get(chapter.parentChapterId) ?? [];
    siblings.push(chapter.id);
    children.set(chapter.parentChapterId, siblings);
  }

  const collected: string[] = [];
  const walk = (id: string) => {
    collected.push(id);
    for (const child of children.get(id) ?? []) walk(child);
  };
  walk(root);
  return collected;
};

export const deleteChapter = withAuthorization(
  ["admin"],
  async (_context, { chapter: id }: { chapter: string }) => {
    const entry = await Chapter.get(Environment.SERVER, id);
    if (!entry.success) return entry;
    if (!entry.data)
      return {
        success: false as const,
        error: new Error("chapter-not-found"),
      };

    const universeId = entry.data.universeId;
    const isRoot = entry.data.parentChapterId === null;

    // Deleting the root chapter removes the whole title — same outcome as
    // deleteUniverse, so route there for a consistent cascade.
    if (isRoot)
      return deleteUniverse(Environment.SERVER, { universe: universeId });

    return withTransaction(async (tx: TransactionScope) => {
      const siblings = await Chapter.find(
        Environment.SERVER,
        { where: eq(schema.chapter.universeId, universeId) },
        { tx },
      );
      if (!siblings.success) return siblings;

      const tree = collectDescendants(id, siblings.data);
      // Deepest first so self-referential parent FKs never block the delete.
      const ordered = [...tree].reverse();

      for (const chapterId of ordered) {
        await tx
          .update(schema.chapter)
          .set({ parentChapterId: null })
          .where(eq(schema.chapter.parentChapterId, chapterId));
        await tx.delete(schema.chapter).where(eq(schema.chapter.id, chapterId));
      }

      const remaining = await Chapter.count(
        Environment.SERVER,
        eq(schema.chapter.universeId, universeId),
        { tx },
      );
      if (remaining.success)
        await Universe.update(
          Environment.SERVER,
          universeId,
          { chapterCount: remaining.data, updatedAt: new Date() },
          { tx },
        );

      return {
        success: true as const,
        data: { id, removed: ordered.length, universeDeleted: false },
      };
    });
  },
  "Admin.deleteChapter",
);

export const topWriters = withAuthorization(
  ["admin"],
  async () => {
    const writers = await User.find(Environment.SERVER, {
      where: or(isNull(schema.user.role), ne(schema.user.role, "admin")),
      orderBy: [{ column: schema.user.coins, direction: "desc" }],
      limit: 10,
    });
    if (!writers.success) return writers;

    const writerIds = writers.data.map((writer) => writer.id);
    const chapters = await Chapter.find(Environment.SERVER, {
      where: and(
        inArray(schema.chapter.authorId, writerIds),
        eq(schema.chapter.status, "approved"),
      ),
    });

    const chapterCounts = chapters.success
      ? chapters.data.reduce<Record<string, number>>((accumulator, chapter) => {
          accumulator[chapter.authorId] =
            (accumulator[chapter.authorId] ?? 0) + 1;
          return accumulator;
        }, {})
      : {};

    const readTotals = chapters.success
      ? chapters.data.reduce<Record<string, number>>((accumulator, chapter) => {
          accumulator[chapter.authorId] =
            (accumulator[chapter.authorId] ?? 0) + chapter.readCount;
          return accumulator;
        }, {})
      : {};

    const likeTotals = chapters.success
      ? chapters.data.reduce<Record<string, number>>((accumulator, chapter) => {
          accumulator[chapter.authorId] =
            (accumulator[chapter.authorId] ?? 0) + chapter.likeCount;
          return accumulator;
        }, {})
      : {};

    return {
      success: true as const,
      data: writers.data.map((writer, index) => ({
        rank: index + 1,
        pseudonym: writer.pseudonym ?? writer.name,
        chapters: chapterCounts[writer.id] ?? 0,
        reads: readTotals[writer.id] ?? 0,
        likes: likeTotals[writer.id] ?? 0,
      })),
    };
  },
  "Admin.topWriters",
);

export const approveUniverse = withAuthorization(
  ["admin"],
  async (context, { universe: id }: { universe: string }) => {
    const entry = await Universe.get(Environment.SERVER, id);
    if (!entry.success) return entry;
    if (!entry.data)
      return {
        success: false as const,
        error: new Error("universe-not-found"),
      };
    if (!entry.data.rootChapterId)
      return {
        success: false as const,
        error: new Error("missing-root-chapter"),
      };

    const rootId = entry.data.rootChapterId;

    return withTransaction(async (tx: TransactionScope) => {
      const published = await Universe.update(
        Environment.SERVER,
        id,
        { status: "published", chapterCount: 1 },
        { tx },
      );
      if (!published.success) return published;

      const approved = await Chapter.update(
        Environment.SERVER,
        rootId,
        { status: "approved" },
        { tx },
      );
      if (!approved.success) return approved;

      const queueEntry = await queue.find(
        Environment.SERVER,
        { where: eq(schema.moderationQueue.chapterId, rootId), limit: 1 },
        { tx },
      );
      if (queueEntry.success && queueEntry.data[0])
        await queue.update(
          Environment.SERVER,
          queueEntry.data[0].id,
          { status: "approved", reviewerId: context.session.user.id },
          { tx },
        );

      await Coin.award(Environment.SERVER, {
        user: entry.data.originatingAuthorId,
        delta: 100,
        reason: "universe_published",
        referenceType: "universe",
        referenceId: id,
        tx,
      });

      return { success: true as const, data: published.data };
    });
  },
  "Admin.approveUniverse",
);

export const rejectUniverse = withAuthorization(
  ["admin"],
  async (
    context,
    { universe: id, reason }: { universe: string; reason: string },
  ) => {
    const entry = await Universe.get(Environment.SERVER, id);
    if (!entry.success) return entry;
    if (!entry.data)
      return {
        success: false as const,
        error: new Error("universe-not-found"),
      };

    return withTransaction(async (tx: TransactionScope) => {
      const rejected = await Universe.update(
        Environment.SERVER,
        id,
        { status: "rejected" },
        { tx },
      );
      if (!rejected.success) return rejected;

      if (entry.data?.rootChapterId) {
        await Chapter.update(
          Environment.SERVER,
          entry.data.rootChapterId,
          { status: "rejected", rejectionReason: reason },
          { tx },
        );
        const queueEntry = await queue.find(
          Environment.SERVER,
          {
            where: eq(
              schema.moderationQueue.chapterId,
              entry.data.rootChapterId,
            ),
            limit: 1,
          },
          { tx },
        );
        if (queueEntry.success && queueEntry.data[0])
          await queue.update(
            Environment.SERVER,
            queueEntry.data[0].id,
            {
              status: "rejected",
              reviewerId: context.session.user.id,
              decisionReason: reason,
            },
            { tx },
          );
      }

      return { success: true as const, data: rejected.data };
    });
  },
  "Admin.rejectUniverse",
);
