"use server";

import { resultify } from "@zenncore/utils";
import type { Override } from "@zenncore/utils/types";
import { and, eq, gt, inArray, like } from "drizzle-orm";
import { unique } from "@/utils/array";
import { schema, type TransactionScope, withTransaction } from "../database";
import { withAuthentication } from "../utils/authentication";
import { withAuthorization } from "../utils/authorization";
import { withContext } from "../utils/context";
import { Environment } from "../utils/environment";
import type { Document } from "../utils/repository";
import { repository } from "../utils/repository";
import * as Chapter from "./chapter";
import * as Genre from "./genre";
import * as User from "./user";

export const { get, paginate, create, update, destroy, exists, count, find } =
  repository(schema.universe);

const queue = repository(schema.moderationQueue);

export type Type = Document<typeof schema.universe>;

export type AuthorRef = {
  id: string;
  pseudonym: string | null;
  name: string;
};

export type Card = Type & {
  author: string | null;
  genreNames: string[];
};

export type AugmentedUniverse = Override<
  Type,
  {
    originatingAuthor: AuthorRef | null;
    genres: Genre.Type[];
    topChapters: Chapter.Type[];
    rootChapter: Chapter.Type | null;
  }
>;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const velocity = (universe: Type): number =>
  universe.readCount + universe.forkCount * 3 + universe.likeCount * 2;

/** Batch-attach author pseudonym + genre names so cards render in 3 queries. */
const decorate = async (universes: Type[]): Promise<Card[]> => {
  if (universes.length === 0) return [];

  const authorIds = unique(universes.map((entry) => entry.originatingAuthorId));
  const genreIds = unique(universes.flatMap((entry) => entry.genres));

  const [authors, genres] = await Promise.all([
    User.find(Environment.SERVER, {
      where: inArray(schema.user.id, authorIds),
    }),
    genreIds.length > 0
      ? Genre.find(Environment.SERVER, {
          where: inArray(schema.genre.id, genreIds),
        })
      : Promise.resolve({ success: true as const, data: [] as Genre.Type[] }),
  ]);

  const authorMap = authors.success
    ? new Map(
        authors.data.map((author) => [
          author.id,
          author.pseudonym ?? author.name,
        ]),
      )
    : new Map<string, string>();
  const genreMap = genres.success
    ? new Map(genres.data.map((genre) => [genre.id, genre.name]))
    : new Map<string, string>();

  return universes.map((entry) => ({
    ...entry,
    author: authorMap.get(entry.originatingAuthorId) ?? null,
    genreNames: entry.genres
      .map((id) => genreMap.get(id))
      .filter((name): name is string => Boolean(name)),
  }));
};

export const bySlug = withContext(async (_, slug: string) => {
  const found = await find(Environment.SERVER, {
    where: eq(schema.universe.slug, slug),
    limit: 1,
  });
  if (!found.success) return found;
  return { success: true as const, data: found.data[0] ?? null };
}, "Universe.bySlug");

export const augmented = withContext(async (_, slug: string) => {
  const found = await find(Environment.SERVER, {
    where: eq(schema.universe.slug, slug),
    limit: 1,
  });
  if (!found.success) return found;

  const universe = found.data[0];
  if (!universe) return { success: true as const, data: null };

  const [author, genres, topChapters, root] = await Promise.all([
    User.get(Environment.SERVER, universe.originatingAuthorId),
    universe.genres.length > 0
      ? Genre.find(Environment.SERVER, {
          where: inArray(schema.genre.id, universe.genres),
        })
      : Promise.resolve({ success: true as const, data: [] as Genre.Type[] }),
    Chapter.find(Environment.SERVER, {
      where: and(
        eq(schema.chapter.universeId, universe.id),
        eq(schema.chapter.status, "approved"),
      ),
      orderBy: [{ column: schema.chapter.readCount, direction: "desc" }],
      limit: 8,
    }),
    universe.rootChapterId
      ? Chapter.get(Environment.SERVER, universe.rootChapterId)
      : Promise.resolve({ success: true as const, data: null }),
  ]);
  if (!author.success) return author;
  if (!genres.success) return genres;
  if (!topChapters.success) return topChapters;
  if (!root.success) return root;

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
      ...universe,
      originatingAuthor: writer,
      genres: genres.data,
      topChapters: topChapters.data,
      rootChapter: root.data,
    } satisfies AugmentedUniverse,
  };
}, "Universe.augmented");

export const listFeatured = withContext(async () => {
  const universes = await find(Environment.SERVER, {
    where: eq(schema.universe.featuredEnabled, true),
    orderBy: [{ column: schema.universe.featuredOrder, direction: "asc" }],
  });
  if (!universes.success) return universes;
  return { success: true as const, data: await decorate(universes.data) };
}, "Universe.listFeatured");

export const listPublished = withContext(
  async (_, { size = 100 }: { size?: number } = {}) => {
    const universes = await find(Environment.SERVER, {
      where: eq(schema.universe.status, "published"),
      orderBy: [
        { column: schema.universe.featuredOrder, direction: "asc" },
        { column: schema.universe.readCount, direction: "desc" },
      ],
      limit: size,
    });
    if (!universes.success) return universes;
    return { success: true as const, data: await decorate(universes.data) };
  },
  "Universe.listPublished",
);

export const trending = withContext(
  async (_, { size = 12 }: { size?: number } = {}) => {
    const universes = await find(Environment.SERVER, {
      where: eq(schema.universe.status, "published"),
      orderBy: [{ column: schema.universe.updatedAt, direction: "desc" }],
      limit: 40,
    });
    if (!universes.success) return universes;

    const ranked = [...universes.data]
      .sort((first, second) => velocity(second) - velocity(first))
      .slice(0, size);
    return { success: true as const, data: await decorate(ranked) };
  },
  "Universe.trending",
);

export const newThisWeek = withContext(
  async (_, { size = 12 }: { size?: number } = {}) => {
    const since = new Date(Date.now() - WEEK_MS);
    const universes = await find(Environment.SERVER, {
      where: and(
        eq(schema.universe.status, "published"),
        gt(schema.universe.createdAt, since),
      ),
      orderBy: [{ column: schema.universe.createdAt, direction: "desc" }],
      limit: size,
    });
    if (!universes.success) return universes;
    return { success: true as const, data: await decorate(universes.data) };
  },
  "Universe.newThisWeek",
);

export const mostForked = withContext(
  async (_, { size = 12 }: { size?: number } = {}) => {
    const universes = await find(Environment.SERVER, {
      where: eq(schema.universe.status, "published"),
      orderBy: [{ column: schema.universe.forkCount, direction: "desc" }],
      limit: size,
    });
    if (!universes.success) return universes;
    return { success: true as const, data: await decorate(universes.data) };
  },
  "Universe.mostForked",
);

export const mostCompleted = withContext(
  async (_, { size = 12 }: { size?: number } = {}) => {
    const universes = await find(Environment.SERVER, {
      where: eq(schema.universe.status, "published"),
      orderBy: [{ column: schema.universe.completion, direction: "desc" }],
      limit: size,
    });
    if (!universes.success) return universes;
    return { success: true as const, data: await decorate(universes.data) };
  },
  "Universe.mostCompleted",
);

export const recommended = withContext(
  async (_, { size = 12 }: { size?: number } = {}) => {
    const universes = await find(Environment.SERVER, {
      where: eq(schema.universe.status, "published"),
      orderBy: [
        { column: schema.universe.rating, direction: "desc" },
        { column: schema.universe.readCount, direction: "desc" },
      ],
      limit: size,
    });
    if (!universes.success) return universes;
    return { success: true as const, data: await decorate(universes.data) };
  },
  "Universe.recommended",
);

export const byIds = withContext(async (_, ids: string[]) => {
  if (ids.length === 0) return { success: true as const, data: [] as Card[] };
  const universes = await find(Environment.SERVER, {
    where: inArray(schema.universe.id, ids),
  });
  if (!universes.success) return universes;
  return { success: true as const, data: await decorate(universes.data) };
}, "Universe.byIds");

export const byAuthor = withContext(async (_, author: string) => {
  const universes = await find(Environment.SERVER, {
    where: eq(schema.universe.originatingAuthorId, author),
    orderBy: [{ column: schema.universe.createdAt, direction: "desc" }],
  });
  if (!universes.success) return universes;
  return { success: true as const, data: await decorate(universes.data) };
}, "Universe.byAuthor");

export const search = withContext(async (_, query: string) => {
  const universes = await find(Environment.SERVER, {
    where: eq(schema.universe.status, "published"),
    orderBy: [{ column: schema.universe.readCount, direction: "desc" }],
    limit: 60,
  });
  if (!universes.success) return universes;

  const needle = query.trim().toLowerCase();
  const matched = needle
    ? universes.data.filter(
        (entry) =>
          entry.title.toLowerCase().includes(needle) ||
          (entry.description ?? "").toLowerCase().includes(needle),
      )
    : universes.data;
  return { success: true as const, data: await decorate(matched) };
}, "Universe.search");

/**
 * Resolve a collision-free slug. A title whose slug already exists (a retry, a
 * common title, or seed data) would otherwise violate the `universe_slug_idx`
 * unique index and throw mid-transaction — which escaped as an unhandled 500
 * and surfaced in the Studio as a silent "nothing happened" on publish. We pick
 * the smallest free numeric suffix instead (`my-world`, `my-world-2`, …), so
 * publishing always succeeds.
 */
const resolveUniqueSlug = async (base: string): Promise<string> => {
  const seed = base.length > 0 ? base : "universe";
  const matches = await find(Environment.SERVER, {
    where: like(schema.universe.slug, `${seed}%`),
  });
  const taken = new Set(
    matches.success ? matches.data.map((entry) => entry.slug) : [],
  );
  if (!taken.has(seed)) return seed;
  for (let suffix = 2; suffix < 10_000; suffix++) {
    const candidate = `${seed}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${seed}-${Date.now()}`;
};

export const createUniverse = withAuthentication(
  async (
    context,
    input: {
      title: string;
      slug: string;
      description?: string;
      cover?: string;
      genres: string[];
      tags?: string[];
      firstChapter: { title: string; body: string; summary?: string };
    },
  ) => {
    // Guarantee a unique slug up front so a title collision can't abort the
    // insert transaction (a duplicate key previously bubbled up as a 500).
    const slug = await resolveUniqueSlug(input.slug);

    // Wrap the whole transaction in resultify: on any failure we throw inside
    // the callback so drizzle rolls back cleanly, and the caller still gets a
    // Result instead of an unhandled rejection.
    const created = await resultify(() =>
      withTransaction(async (tx: TransactionScope) => {
        const universe = await create(
          Environment.SERVER,
          {
            slug,
            title: input.title,
            description: input.description,
            cover: input.cover,
            genres: input.genres,
            tags: input.tags ?? [],
            originatingAuthorId: context.session.user.id,
            status: "submitted",
          },
          { tx },
        );
        if (!universe.success) throw universe.error;

        const root = await Chapter.create(
          Environment.SERVER,
          {
            universeId: universe.data.id,
            parentChapterId: null,
            authorId: context.session.user.id,
            title: input.firstChapter.title,
            body: input.firstChapter.body,
            summary: input.firstChapter.summary,
            depth: 0,
            wordCount: input.firstChapter.body
              .trim()
              .split(/\s+/)
              .filter(Boolean).length,
            status: "submitted",
          },
          { tx },
        );
        if (!root.success) throw root.error;

        const queued = await queue.create(
          Environment.SERVER,
          {
            chapterId: root.data.id,
            submittedBy: context.session.user.id,
            status: "pending",
          },
          { tx },
        );
        if (!queued.success) throw queued.error;

        const finished = await update(
          Environment.SERVER,
          universe.data.id,
          { rootChapterId: root.data.id, chapterCount: 1 },
          { tx },
        );
        if (!finished.success) throw finished.error;
        return finished.data;
      }),
    );

    // Never surface the raw DatabaseError — its message embeds the failed SQL
    // and the serialized chapter body. Keep it as `cause` so Sentry still gets
    // the detail, and hand the writer a message they can act on.
    if (!created.success)
      return {
        success: false as const,
        error: new Error(
          "We couldn't publish your universe. Please try again.",
          {
            cause: created.error,
          },
        ),
      };
    return { success: true as const, data: created.data };
  },
  "Universe.createUniverse",
);

export const incrementReads = withContext(
  async (_, { universe }: { universe: string }) => {
    const updated = await find(Environment.SERVER, {
      where: eq(schema.universe.id, universe),
      limit: 1,
    });
    if (!updated.success || !updated.data[0])
      return { success: true as const, data: true };
    await update(Environment.SERVER, universe, {
      readCount: updated.data[0].readCount + 1,
    });
    return { success: true as const, data: true };
  },
  "Universe.incrementReads",
);

export const toggleFeatured = withAuthorization(
  ["admin"],
  async (
    _,
    input: {
      universe: string;
      enabled: boolean;
      order?: number;
      hook?: string;
    },
  ) =>
    update(Environment.SERVER, input.universe, {
      featured: input.enabled,
      featuredEnabled: input.enabled,
      featuredOrder: input.order,
      featuredHook: input.hook,
    }),
  "Universe.toggleFeatured",
);
