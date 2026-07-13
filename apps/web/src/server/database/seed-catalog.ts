import { eq, sql } from "drizzle-orm";
import { db, schema } from "./index";
import { CATALOG_UNIVERSES } from "./catalog";

const countWords = (body: string): number =>
  body.trim().split(/\s+/).filter(Boolean).length;

const summarise = (body: string): string =>
  `${body.trim().split(/(?<=[.!?])\s/)[0] ?? body.slice(0, 90)}`;

const userId = (key: string) => `usr_${key}`;
const genreId = (slug: string) => `gnr_${slug}`;
const universeId = (slug: string) => `unv_${slug}`;
const chapterId = (slug: string) => `chp_${universeId(slug)}_r`;

/**
 * Upserts the manuscript catalog from the chillpen prototype zip.
 * Safe to re-run — updates covers, hooks, and chapter bodies in place.
 */
export const seedCatalog = async () => {
  for (const entry of CATALOG_UNIVERSES) {
    const id = universeId(entry.slug);
    const rootId = chapterId(entry.slug);
    const author = userId(entry.author);
    const wordCount = countWords(entry.body);

    const existing = await db
      .select({ id: schema.universe.id, rootChapterId: schema.universe.rootChapterId })
      .from(schema.universe)
      .where(eq(schema.universe.slug, entry.slug))
      .limit(1);

    const universeKey = existing[0]?.id ?? id;
    const rootKey = existing[0]?.rootChapterId ?? rootId;

    await db
      .insert(schema.universe)
      .values({
        id: universeKey,
        slug: entry.slug,
        title: entry.title,
        description: entry.description,
        cover: entry.cover,
        genres: entry.genres.map(genreId),
        originatingAuthorId: author,
        rootChapterId: rootKey,
        status: "published",
        completion: entry.completion * 10,
        rating: entry.rating,
        readCount: entry.reads,
        forkCount: entry.forks,
        likeCount: entry.likes,
        saveCount: entry.saves,
        contributorCount: 1,
        chapterCount: 1,
        featured: true,
        featuredEnabled: true,
        featuredOrder: entry.featuredOrder,
        featuredHook: entry.hook,
      })
      .onConflictDoUpdate({
        target: schema.universe.slug,
        set: {
          title: entry.title,
          description: entry.description,
          cover: entry.cover,
          genres: entry.genres.map(genreId),
          completion: entry.completion * 10,
          rating: entry.rating,
          readCount: entry.reads,
          likeCount: entry.likes,
          saveCount: entry.saves,
          featured: true,
          featuredEnabled: true,
          featuredOrder: entry.featuredOrder,
          featuredHook: entry.hook,
          rootChapterId: rootKey,
          updatedAt: sql`now()`,
        },
      });

    await db
      .insert(schema.chapter)
      .values({
        id: rootKey,
        universeId: universeKey,
        parentChapterId: null,
        authorId: author,
        title: entry.chapterTitle,
        body: entry.body,
        summary: summarise(entry.body),
        depth: 0,
        wordCount,
        status: "approved",
        readCount: entry.reads,
        forkCount: entry.forks,
        likeCount: entry.likes,
        completionRate: entry.completion * 10,
      })
      .onConflictDoUpdate({
        target: schema.chapter.id,
        set: {
          title: entry.chapterTitle,
          body: entry.body,
          summary: summarise(entry.body),
          wordCount,
          readCount: entry.reads,
          likeCount: entry.likes,
          updatedAt: sql`now()`,
        },
      });
  }

  return CATALOG_UNIVERSES.length;
};
