import { eq } from "drizzle-orm";
import { db, schema } from "./index";

const userId = (key: string) => `usr_${key}`;

const rootChapterForSlug = async (slug: string) => {
  const rows = await db
    .select({
      universeId: schema.universe.id,
      rootChapterId: schema.universe.rootChapterId,
    })
    .from(schema.universe)
    .where(eq(schema.universe.slug, slug))
    .limit(1);
  return rows[0] ?? null;
};

/**
 * Demo moderation queue entries mirroring the chillpen prototype admin panel.
 */
export const seedModerationDemo = async () => {
  const pendingUniverseId = "unv_the-cartographers-debt";
  const pendingRootId = "chp_unv_the-cartographers-debt_r";
  const school = await rootChapterForSlug("school-of-magic");
  const club = await rootChapterForSlug("the-almost-love-club");

  await db
    .insert(schema.universe)
    .values({
      id: pendingUniverseId,
      slug: "the-cartographers-debt",
      title: "The Cartographer's Debt",
      description:
        "Every map Ines ever drew came true within a year. The coastline she invented as a joke is now a country, and its king has finally found her address.",
      cover: "/covers/rikimaru.jpg",
      genres: ["gnr_mystery", "gnr_fantasy"],
      originatingAuthorId: userId("void"),
      rootChapterId: pendingRootId,
      status: "submitted",
      completion: 40,
      rating: 45,
      chapterCount: 1,
    })
    .onConflictDoNothing();

  await db
    .insert(schema.chapter)
    .values({
      id: pendingRootId,
      universeId: pendingUniverseId,
      parentChapterId: null,
      authorId: userId("void"),
      title: "The Cartographer's Debt",
      body: "Every map Ines ever drew came true within a year. The coastline she invented as a joke is now a country, and its king has finally found her address.",
      summary: "Every map Ines ever drew came true within a year.",
      depth: 0,
      wordCount: 1460,
      status: "submitted",
    })
    .onConflictDoNothing();

  await db
    .insert(schema.moderationQueue)
    .values({
      id: "mod_universe_cartographer",
      chapterId: pendingRootId,
      submittedBy: userId("void"),
      status: "pending",
    })
    .onConflictDoNothing();

  if (school?.rootChapterId) {
    const schoolContinuationId = "chp_unv_school-of-magic_pending";
    await db
      .insert(schema.chapter)
      .values({
        id: schoolContinuationId,
        universeId: school.universeId,
        parentChapterId: school.rootChapterId,
        authorId: userId("neon"),
        title: "The Second Bell of Asteri",
        body: "The bell that woke Dimitri on his second morning was not a bell at all — it was the island itself, humming through the marble like a struck chord. Miranda was already at his door, ink on four fingers this time.",
        summary:
          "The bell that woke Dimitri on his second morning was not a bell at all.",
        depth: 1,
        wordCount: 1240,
        status: "submitted",
      })
      .onConflictDoNothing();

    await db
      .insert(schema.moderationQueue)
      .values({
        id: "mod_chapter_school",
        chapterId: schoolContinuationId,
        submittedBy: userId("neon"),
        status: "pending",
      })
      .onConflictDoNothing();
  }

  if (club?.rootChapterId) {
    const clubContinuationId = "chp_unv_the-almost-love-club_pending";
    await db
      .insert(schema.chapter)
      .values({
        id: clubContinuationId,
        universeId: club.universeId,
        parentChapterId: club.rootChapterId,
        authorId: userId("ember"),
        title: "Rule Five",
        body: "Rule five arrived at 1 a.m., typed by Nina with the solemnity of a constitutional amendment: no man who has ever said the words 'my ex was crazy' may be defended in this booth.",
        summary: "Rule five arrived at 1 a.m.",
        depth: 1,
        wordCount: 980,
        status: "submitted",
      })
      .onConflictDoNothing();

    await db
      .insert(schema.moderationQueue)
      .values({
        id: "mod_chapter_club",
        chapterId: clubContinuationId,
        submittedBy: userId("ember"),
        status: "pending",
      })
      .onConflictDoNothing();
  }
};
