"use server";

import { resultify } from "@zenncore/utils";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { unique } from "@/utils/array";
import { schema, type TransactionScope, withTransaction } from "../database";
import type { ContinuityFlag } from "../database/schema";
import { generate } from "../utils/ai";
import { withAuthentication } from "../utils/authentication";
import { withAuthorization } from "../utils/authorization";
import { withContext } from "../utils/context";
import { Environment } from "../utils/environment";
import { type Document, increment, repository } from "../utils/repository";
import * as Coin from "./coin";
import * as User from "./user";

export const { get, paginate, create, update, destroy, exists, count, find } =
  repository(schema.chapter);

const likes = repository(schema.chapterLike);
const queue = repository(schema.moderationQueue);

export type Type = Document<typeof schema.chapter>;

export type ChapterAuthor = {
  id: string;
  pseudonym: string | null;
  name: string;
};

export type AugmentedChapter = Type & {
  author: ChapterAuthor | null;
  branches: Type[];
  parent: Type | null;
};

export type ChapterNode = Pick<
  Type,
  | "id"
  | "parentChapterId"
  | "title"
  | "summary"
  | "depth"
  | "readCount"
  | "forkCount"
  | "likeCount"
  | "authorId"
>;

const countWords = (body: string): number =>
  body.trim().split(/\s+/).filter(Boolean).length;

const ancestry = async (
  id: string | null,
  collected: Type[] = [],
): Promise<Type[]> => {
  if (!id) return collected;
  const chapter = await get(Environment.SERVER, id);
  if (!chapter.success || !chapter.data) return collected;
  return ancestry(chapter.data.parentChapterId, [chapter.data, ...collected]);
};

/** The "choose your continuation" query — approved children, strongest first. */
export const children = withContext(
  async (_, { chapter }: { chapter: string }) =>
    find(Environment.SERVER, {
      where: and(
        eq(schema.chapter.parentChapterId, chapter),
        eq(schema.chapter.status, "approved"),
      ),
      orderBy: [{ column: schema.chapter.readCount, direction: "desc" }],
    }),
  "Chapter.children",
);

export type Continuation = Type & { author: string | null };

/** Approved next-chapter branches, each attributed to its writer. */
export const continuations = withContext(
  async (_, { chapter }: { chapter: string }) => {
    const branches = await children(Environment.SERVER, { chapter });
    if (!branches.success) return branches;

    const authorIds = unique(branches.data.map((branch) => branch.authorId));
    const authors =
      authorIds.length > 0
        ? await User.find(Environment.SERVER, {
            where: inArray(schema.user.id, authorIds),
          })
        : { success: true as const, data: [] as User.Type[] };

    const map = authors.success
      ? new Map(
          authors.data.map((author) => [
            author.id,
            author.pseudonym ?? author.name,
          ]),
        )
      : new Map<string, string>();

    return {
      success: true as const,
      data: branches.data.map(
        (branch): Continuation => ({
          ...branch,
          author: map.get(branch.authorId) ?? null,
        }),
      ),
    };
  },
  "Chapter.continuations",
);

export const augmented = withContext(async (_, id: string) => {
  const chapter = await get(Environment.SERVER, id);
  if (!chapter.success) return chapter;
  if (!chapter.data) return { success: true as const, data: null };

  const node = chapter.data;
  const [author, branches, parent] = await Promise.all([
    User.get(Environment.SERVER, node.authorId),
    children(Environment.SERVER, { chapter: node.id }),
    node.parentChapterId
      ? get(Environment.SERVER, node.parentChapterId)
      : Promise.resolve({ success: true as const, data: null }),
  ]);
  if (!author.success) return author;
  if (!branches.success) return branches;
  if (!parent.success) return parent;

  const writer = author.data
    ? {
        id: author.data.id,
        pseudonym: author.data.pseudonym,
        name: author.data.name,
      }
    : null;

  return {
    success: true as const,
    data: {
      ...node,
      author: writer,
      branches: branches.data,
      parent: parent.data,
    } satisfies AugmentedChapter,
  };
}, "Chapter.augmented");

/** Full universe tree as lightweight nodes (no body) for the map. */
export const tree = withContext(
  async (_, { universe }: { universe: string }) => {
    const rows = await find(Environment.SERVER, {
      where: and(
        eq(schema.chapter.universeId, universe),
        eq(schema.chapter.status, "approved"),
      ),
      orderBy: [{ column: schema.chapter.depth, direction: "asc" }],
    });
    if (!rows.success) return rows;

    const nodes = rows.data.map(
      (row): ChapterNode => ({
        id: row.id,
        parentChapterId: row.parentChapterId,
        title: row.title,
        summary: row.summary,
        depth: row.depth,
        readCount: row.readCount,
        forkCount: row.forkCount,
        likeCount: row.likeCount,
        authorId: row.authorId,
      }),
    );
    return { success: true as const, data: nodes };
  },
  "Chapter.tree",
);

export const drafts = withAuthentication(
  async (context) =>
    find(Environment.SERVER, {
      where: and(
        eq(schema.chapter.authorId, context.session.user.id),
        inArray(schema.chapter.status, ["draft", "submitted", "rejected"]),
      ),
      orderBy: [{ column: schema.chapter.updatedAt, direction: "desc" }],
    }),
  "Chapter.drafts",
);

export const fork = withAuthentication(
  async (
    context,
    input: { parent: string; title: string; body: string; summary?: string },
  ) => {
    const parent = await get(Environment.SERVER, input.parent);
    if (!parent.success) return parent;
    if (!parent.data)
      return { success: false as const, error: new Error("parent-not-found") };

    return create(Environment.SERVER, {
      universeId: parent.data.universeId,
      parentChapterId: input.parent,
      authorId: context.session.user.id,
      title: input.title,
      body: input.body,
      summary: input.summary,
      depth: parent.data.depth + 1,
      wordCount: countWords(input.body),
      status: "draft",
    });
  },
  "Chapter.fork",
);

export const saveDraft = withAuthentication(
  async (
    context,
    input: { chapter: string; title?: string; body?: string; summary?: string },
  ) => {
    const chapter = await get(Environment.SERVER, input.chapter);
    if (!chapter.success) return chapter;
    if (!chapter.data)
      return { success: false as const, error: new Error("chapter-not-found") };
    if (chapter.data.authorId !== context.session.user.id)
      return { success: false as const, error: new Error("forbidden") };

    const wordCount =
      input.body === undefined
        ? chapter.data.wordCount
        : countWords(input.body);

    return update(Environment.SERVER, input.chapter, {
      title: input.title,
      body: input.body,
      summary: input.summary,
      wordCount,
    });
  },
  "Chapter.saveDraft",
);

export const submitForApproval = withAuthentication(
  async (context, { chapter: id }: { chapter: string }) => {
    const chapter = await get(Environment.SERVER, id);
    if (!chapter.success) return chapter;
    if (!chapter.data)
      return { success: false as const, error: new Error("chapter-not-found") };
    if (chapter.data.authorId !== context.session.user.id)
      return { success: false as const, error: new Error("forbidden") };

    return withTransaction(async (tx: TransactionScope) => {
      const updated = await update(
        Environment.SERVER,
        id,
        { status: "submitted" },
        { tx },
      );
      if (!updated.success) return updated;

      const queued = await queue.create(
        Environment.SERVER,
        {
          chapterId: id,
          submittedBy: context.session.user.id,
          status: "pending",
        },
        { tx },
      );
      if (!queued.success) return queued;

      return { success: true as const, data: updated.data };
    });
  },
  "Chapter.submitForApproval",
);

export const approve = withAuthorization(
  ["admin"],
  async (context, { chapter: id }: { chapter: string }) => {
    const chapter = await get(Environment.SERVER, id);
    if (!chapter.success) return chapter;
    if (!chapter.data)
      return { success: false as const, error: new Error("chapter-not-found") };

    const node = chapter.data;
    return withTransaction(async (tx: TransactionScope) => {
      const updated = await update(
        Environment.SERVER,
        id,
        { status: "approved" },
        { tx },
      );
      if (!updated.success) return updated;

      await increment(Environment.SERVER, schema.universe, node.universeId, {
        column: schema.universe.chapterCount,
        tx,
      });

      if (node.parentChapterId) {
        await increment(
          Environment.SERVER,
          schema.chapter,
          node.parentChapterId,
          {
            column: schema.chapter.forkCount,
            tx,
          },
        );
        await increment(Environment.SERVER, schema.universe, node.universeId, {
          column: schema.universe.forkCount,
          tx,
        });
      }

      const entry = await queue.find(
        Environment.SERVER,
        { where: eq(schema.moderationQueue.chapterId, id), limit: 1 },
        { tx },
      );
      if (entry.success && entry.data[0])
        await queue.update(
          Environment.SERVER,
          entry.data[0].id,
          { status: "approved", reviewerId: context.session.user.id },
          { tx },
        );

      await Coin.award(Environment.SERVER, {
        user: node.authorId,
        delta: 50,
        reason: "chapter_published",
        referenceType: "chapter",
        referenceId: id,
        tx,
      });

      return { success: true as const, data: updated.data };
    });
  },
  "Chapter.approve",
);

export const reject = withAuthorization(
  ["admin"],
  async (
    context,
    { chapter: id, reason }: { chapter: string; reason: string },
  ) =>
    withTransaction(async (tx: TransactionScope) => {
      const updated = await update(
        Environment.SERVER,
        id,
        { status: "rejected", rejectionReason: reason },
        { tx },
      );
      if (!updated.success) return updated;

      const entry = await queue.find(
        Environment.SERVER,
        { where: eq(schema.moderationQueue.chapterId, id), limit: 1 },
        { tx },
      );
      if (entry.success && entry.data[0])
        await queue.update(
          Environment.SERVER,
          entry.data[0].id,
          {
            status: "rejected",
            reviewerId: context.session.user.id,
            decisionReason: reason,
          },
          { tx },
        );

      return { success: true as const, data: updated.data };
    }),
  "Chapter.reject",
);

export const like = withAuthentication(
  async (context, { chapter: id }: { chapter: string }) => {
    const chapter = await get(Environment.SERVER, id);
    if (!chapter.success) return chapter;
    if (!chapter.data)
      return { success: false as const, error: new Error("chapter-not-found") };

    const universe = chapter.data.universeId;
    const existing = await likes.find(Environment.SERVER, {
      where: and(
        eq(schema.chapterLike.userId, context.session.user.id),
        eq(schema.chapterLike.chapterId, id),
      ),
      limit: 1,
    });
    if (!existing.success) return existing;

    return withTransaction(async (tx: TransactionScope) => {
      const current = existing.data[0];
      const direction = current ? -1 : 1;

      if (current) await likes.destroy(Environment.SERVER, current.id, { tx });
      else
        await likes.create(
          Environment.SERVER,
          { userId: context.session.user.id, chapterId: id },
          { tx },
        );

      await increment(Environment.SERVER, schema.chapter, id, {
        column: schema.chapter.likeCount,
        by: direction,
        tx,
      });
      await increment(Environment.SERVER, schema.universe, universe, {
        column: schema.universe.likeCount,
        by: direction,
        tx,
      });

      return { success: true as const, data: { liked: !current } };
    });
  },
  "Chapter.like",
);

export const incrementReads = withContext(
  async (_, { chapter: id }: { chapter: string }) => {
    const chapter = await get(Environment.SERVER, id);
    if (!chapter.success || !chapter.data)
      return { success: true as const, data: true };

    const universe = chapter.data.universeId;
    return withTransaction(async (tx: TransactionScope) => {
      await increment(Environment.SERVER, schema.chapter, id, {
        column: schema.chapter.readCount,
        tx,
      });
      await increment(Environment.SERVER, schema.universe, universe, {
        column: schema.universe.readCount,
        tx,
      });
      return { success: true as const, data: true };
    });
  },
  "Chapter.incrementReads",
);

export const consistencyCheck = withAuthentication(
  async (_, { chapter: id }: { chapter: string }) => {
    const chapter = await get(Environment.SERVER, id);
    if (!chapter.success) return chapter;
    if (!chapter.data)
      return { success: false as const, error: new Error("chapter-not-found") };

    const ancestors = await ancestry(chapter.data.parentChapterId);
    const result = await resultify(() =>
      generate({
        system:
          "You are a story-continuity checker. Flag contradictions (deaths, locations, timeline, named entities, tone) between the NEW chapter and its ancestor chapters. Be concise.",
        prompt: `Ancestor chapters:\n${ancestors
          .map((entry) => entry.body)
          .join("\n---\n")}\n\nNew chapter:\n${chapter.data.body}`,
        schema: z.object({
          flags: z.array(
            z.object({
              kind: z.enum(["death", "location", "timeline", "entity", "tone"]),
              message: z.string(),
            }),
          ),
        }),
      }),
    );

    if (!result.success)
      return { success: true as const, data: [] as ContinuityFlag[] };
    return {
      success: true as const,
      data: result.data.flags as ContinuityFlag[],
    };
  },
  "Chapter.consistencyCheck",
);

export const generateSummary = withAuthentication(
  async (_, { chapter: id }: { chapter: string }) => {
    const chapter = await get(Environment.SERVER, id);
    if (!chapter.success) return chapter;
    if (!chapter.data)
      return { success: false as const, error: new Error("chapter-not-found") };

    const result = await resultify(() =>
      generate({
        system:
          "Summarise this chapter in one vivid sentence for a branch-map preview.",
        prompt: chapter.data.body,
        schema: z.object({ summary: z.string() }),
      }),
    );

    if (!result.success)
      return { success: true as const, data: { summary: "" } };
    return { success: true as const, data: { summary: result.data.summary } };
  },
  "Chapter.generateSummary",
);
