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
