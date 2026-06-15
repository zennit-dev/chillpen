import { relations as relation, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * chillpen.club schema — the branching narrative engine.
 *
 * Better-auth core tables (user/session/account/verification) are kept
 * compatible with the drizzleAdapter; the chillpen domain (universe, chapter
 * tree, economy, moderation) is layered on top. The whole universe map is a
 * traversal of `chapter.parentChapterId`.
 */

export type AvatarConfig = {
  frame?: string;
  effect?: string;
  items?: string[];
};

export type ContinuityFlag = {
  kind: "death" | "location" | "timeline" | "entity" | "tone";
  message: string;
  chapter?: string;
};

export type ModerationResult = {
  flagged: boolean;
  categories: Record<string, boolean>;
  scores: Record<string, number>;
};

export type LeaderboardEntry = {
  user: string;
  pseudonym: string;
  score: number;
  rank: number;
  delta?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Better-auth core (compatible with drizzleAdapter). chillpen identity columns
// are appended to `user` (pseudonym, coins, subscription, avatar economy).
// ─────────────────────────────────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  // additionalFields from auth config
  surname: text("surname").notNull(),
  role: text("role"),
  jobTitle: text("jobTitle"),
  company: text("company"),
  source: text("source"),
  // chillpen identity + economy
  pseudonym: text("pseudonym").unique(),
  bio: text("bio"),
  banner: text("banner"),
  coins: integer("coins").notNull().default(0),
  avatarConfig: jsonb("avatarConfig")
    .$type<AvatarConfig>()
    .notNull()
    .default({}),
  badges: jsonb("badges").$type<string[]>().notNull().default([]),
  followerCount: integer("followerCount").notNull().default(0),
  followingCount: integer("followingCount").notNull().default(0),
  subscriptionStatus: text("subscriptionStatus").notNull().default("trial"),
  stripeCustomerId: text("stripeCustomerId"),
  stripeSubscriptionId: text("stripeSubscriptionId"),
  trialEndsAt: timestamp("trialEndsAt", { mode: "date" }),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("session_user_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { mode: "date" }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { mode: "date" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("account_user_idx").on(table.userId)],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────────
// chillpen domain
// ─────────────────────────────────────────────────────────────────────────────

export const genre = pgTable(
  "genre",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    accent: text("accent"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("genre_slug_idx").on(table.slug)],
);

export const universe = pgTable(
  "universe",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    cover: text("cover"),
    genres: jsonb("genres").$type<string[]>().notNull().default([]),
    originatingAuthorId: text("originatingAuthorId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rootChapterId: text("rootChapterId"),
    status: text("status").notNull().default("published"),
    completion: integer("completion").notNull().default(0),
    rating: integer("rating").notNull().default(0),
    readCount: integer("readCount").notNull().default(0),
    forkCount: integer("forkCount").notNull().default(0),
    likeCount: integer("likeCount").notNull().default(0),
    saveCount: integer("saveCount").notNull().default(0),
    contributorCount: integer("contributorCount").notNull().default(1),
    chapterCount: integer("chapterCount").notNull().default(0),
    featured: boolean("featured").notNull().default(false),
    featuredEnabled: boolean("featuredEnabled").notNull().default(false),
    featuredOrder: integer("featuredOrder").notNull().default(0),
    featuredHook: text("featuredHook"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("universe_slug_idx").on(table.slug),
    index("universe_author_idx").on(table.originatingAuthorId),
    index("universe_featured_idx").on(
      table.featuredEnabled,
      table.featuredOrder,
    ),
    index("universe_fork_idx").on(table.forkCount),
    index("universe_read_idx").on(table.readCount),
    index("universe_created_idx").on(table.createdAt),
  ],
);

export const chapter = pgTable(
  "chapter",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    universeId: text("universeId")
      .notNull()
      .references(() => universe.id, { onDelete: "cascade" }),
    // self-reference → the branching tree. null = root chapter.
    parentChapterId: text("parentChapterId").references(
      (): AnyPgColumn => chapter.id,
      { onDelete: "set null" },
    ),
    authorId: text("authorId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    summary: text("summary"),
    depth: integer("depth").notNull().default(0),
    wordCount: integer("wordCount").notNull().default(0),
    status: text("status").notNull().default("draft"),
    rejectionReason: text("rejectionReason"),
    continuityFlags: jsonb("continuityFlags")
      .$type<ContinuityFlag[]>()
      .notNull()
      .default([]),
    moderationResult: jsonb("moderationResult").$type<ModerationResult>(),
    readCount: integer("readCount").notNull().default(0),
    forkCount: integer("forkCount").notNull().default(0),
    likeCount: integer("likeCount").notNull().default(0),
    completionRate: integer("completionRate").notNull().default(0),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("chapter_parent_idx").on(table.parentChapterId),
    index("chapter_universe_idx").on(table.universeId),
    index("chapter_author_idx").on(table.authorId),
    index("chapter_status_idx").on(table.status),
    index("chapter_universe_status_idx").on(table.universeId, table.status),
  ],
);

export const readPath = pgTable(
  "readPath",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    universeId: text("universeId")
      .notNull()
      .references(() => universe.id, { onDelete: "cascade" }),
    chapters: jsonb("chapters").$type<string[]>().notNull().default([]),
    cursor: text("cursor"),
    completed: boolean("completed").notNull().default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("read_path_user_universe_idx").on(
      table.userId,
      table.universeId,
    ),
    index("read_path_user_idx").on(table.userId),
  ],
);

export const save = pgTable(
  "save",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetType: text("targetType").notNull(),
    targetId: text("targetId").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("save_user_target_idx").on(
      table.userId,
      table.targetType,
      table.targetId,
    ),
    index("save_user_idx").on(table.userId),
  ],
);

export const coinLedger = pgTable(
  "coinLedger",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    reason: text("reason").notNull(),
    referenceType: text("referenceType"),
    referenceId: text("referenceId"),
    balanceAfter: integer("balanceAfter").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("coin_ledger_user_idx").on(table.userId)],
);

export const cosmetic = pgTable(
  "cosmetic",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    rarity: text("rarity").notNull(),
    asset: text("asset").notNull(),
    price: integer("price"),
    shopDisabled: boolean("shopDisabled").notNull().default(false),
    dropStartsAt: timestamp("dropStartsAt", { mode: "date" }),
    dropEndsAt: timestamp("dropEndsAt", { mode: "date" }),
    retired: boolean("retired").notNull().default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("cosmetic_slug_idx").on(table.slug),
    index("cosmetic_shop_idx").on(table.shopDisabled, table.retired),
  ],
);

export const userCosmetic = pgTable(
  "userCosmetic",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    cosmeticId: text("cosmeticId")
      .notNull()
      .references(() => cosmetic.id, { onDelete: "cascade" }),
    equipped: boolean("equipped").notNull().default(false),
    source: text("source").notNull().default("purchase"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("user_cosmetic_idx").on(table.userId, table.cosmeticId),
    index("user_cosmetic_user_idx").on(table.userId),
  ],
);

export const chapterLike = pgTable(
  "chapterLike",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    chapterId: text("chapterId")
      .notNull()
      .references(() => chapter.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("chapter_like_idx").on(table.userId, table.chapterId),
  ],
);

export const follow = pgTable(
  "follow",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    followerId: text("followerId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    followingId: text("followingId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("follow_pair_idx").on(table.followerId, table.followingId),
    index("follow_following_idx").on(table.followingId),
  ],
);

export const challenge = pgTable(
  "challenge",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    prompt: text("prompt").notNull(),
    cover: text("cover"),
    prizeCosmeticId: text("prizeCosmeticId").references(() => cosmetic.id, {
      onDelete: "set null",
    }),
    prizeCoins: integer("prizeCoins").notNull().default(0),
    startsAt: timestamp("startsAt", { mode: "date" }).notNull(),
    endsAt: timestamp("endsAt", { mode: "date" }).notNull(),
    status: text("status").notNull().default("upcoming"),
    winnerId: text("winnerId").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("challenge_slug_idx").on(table.slug),
    index("challenge_status_idx").on(table.status, table.endsAt),
  ],
);

export const leaderboardSnapshot = pgTable(
  "leaderboardSnapshot",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    scope: text("scope").notNull(),
    genreId: text("genreId").references(() => genre.id, {
      onDelete: "cascade",
    }),
    period: text("period").notNull(),
    entries: jsonb("entries").$type<LeaderboardEntry[]>().notNull().default([]),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("leaderboard_idx").on(table.scope, table.genreId, table.period),
  ],
);

export const abuseReport = pgTable(
  "abuseReport",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    reporterId: text("reporterId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetType: text("targetType").notNull(),
    targetId: text("targetId").notNull(),
    reason: text("reason").notNull(),
    details: text("details"),
    status: text("status").notNull().default("open"),
    resolverId: text("resolverId").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("abuse_report_status_idx").on(table.status)],
);

export const moderationQueue = pgTable(
  "moderationQueue",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    chapterId: text("chapterId")
      .notNull()
      .references(() => chapter.id, { onDelete: "cascade" }),
    submittedBy: text("submittedBy")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    moderationResult: jsonb("moderationResult").$type<ModerationResult>(),
    continuityFlags: jsonb("continuityFlags")
      .$type<ContinuityFlag[]>()
      .notNull()
      .default([]),
    status: text("status").notNull().default("pending"),
    reviewerId: text("reviewerId").references(() => user.id, {
      onDelete: "set null",
    }),
    decisionReason: text("decisionReason"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("moderation_queue_status_idx").on(table.status, table.createdAt),
    uniqueIndex("moderation_queue_chapter_idx").on(table.chapterId),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// Relations (drizzle RQB). Queries in app modules use explicit repository joins;
// these power optional `db.query.*` access and document the graph.
// ─────────────────────────────────────────────────────────────────────────────

export const userRelations = relation(user, ({ many }) => ({
  universes: many(universe),
  chapters: many(chapter),
  readPaths: many(readPath),
  saves: many(save),
  ledger: many(coinLedger),
  cosmetics: many(userCosmetic),
  likes: many(chapterLike),
  followers: many(follow, { relationName: "following" }),
  following: many(follow, { relationName: "follower" }),
}));

export const universeRelations = relation(universe, ({ one, many }) => ({
  originatingAuthor: one(user, {
    fields: [universe.originatingAuthorId],
    references: [user.id],
  }),
  chapters: many(chapter),
  readPaths: many(readPath),
}));

export const chapterRelations = relation(chapter, ({ one, many }) => ({
  universe: one(universe, {
    fields: [chapter.universeId],
    references: [universe.id],
  }),
  author: one(user, { fields: [chapter.authorId], references: [user.id] }),
  parent: one(chapter, {
    fields: [chapter.parentChapterId],
    references: [chapter.id],
    relationName: "chapter_parent",
  }),
  children: many(chapter, { relationName: "chapter_parent" }),
  likes: many(chapterLike),
}));

export const readPathRelations = relation(readPath, ({ one }) => ({
  user: one(user, { fields: [readPath.userId], references: [user.id] }),
  universe: one(universe, {
    fields: [readPath.universeId],
    references: [universe.id],
  }),
}));

export const saveRelations = relation(save, ({ one }) => ({
  user: one(user, { fields: [save.userId], references: [user.id] }),
}));

export const coinLedgerRelations = relation(coinLedger, ({ one }) => ({
  user: one(user, { fields: [coinLedger.userId], references: [user.id] }),
}));

export const cosmeticRelations = relation(cosmetic, ({ many }) => ({
  owners: many(userCosmetic),
}));

export const userCosmeticRelations = relation(userCosmetic, ({ one }) => ({
  user: one(user, { fields: [userCosmetic.userId], references: [user.id] }),
  cosmetic: one(cosmetic, {
    fields: [userCosmetic.cosmeticId],
    references: [cosmetic.id],
  }),
}));

export const chapterLikeRelations = relation(chapterLike, ({ one }) => ({
  user: one(user, { fields: [chapterLike.userId], references: [user.id] }),
  chapter: one(chapter, {
    fields: [chapterLike.chapterId],
    references: [chapter.id],
  }),
}));

export const followRelations = relation(follow, ({ one }) => ({
  follower: one(user, {
    fields: [follow.followerId],
    references: [user.id],
    relationName: "follower",
  }),
  following: one(user, {
    fields: [follow.followingId],
    references: [user.id],
    relationName: "following",
  }),
}));

export const challengeRelations = relation(challenge, ({ one }) => ({
  prizeCosmetic: one(cosmetic, {
    fields: [challenge.prizeCosmeticId],
    references: [cosmetic.id],
  }),
  winner: one(user, { fields: [challenge.winnerId], references: [user.id] }),
}));

export const moderationQueueRelations = relation(
  moderationQueue,
  ({ one }) => ({
    chapter: one(chapter, {
      fields: [moderationQueue.chapterId],
      references: [chapter.id],
    }),
    submitter: one(user, {
      fields: [moderationQueue.submittedBy],
      references: [user.id],
    }),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Aggregates consumed by database/index.ts (`schema` = tables, RQB = relations)
// ─────────────────────────────────────────────────────────────────────────────

export const tables = {
  user,
  session,
  account,
  verification,
  genre,
  universe,
  chapter,
  readPath,
  save,
  coinLedger,
  cosmetic,
  userCosmetic,
  chapterLike,
  follow,
  challenge,
  leaderboardSnapshot,
  abuseReport,
  moderationQueue,
};

export const relations = {
  userRelations,
  universeRelations,
  chapterRelations,
  readPathRelations,
  saveRelations,
  coinLedgerRelations,
  cosmeticRelations,
  userCosmeticRelations,
  chapterLikeRelations,
  followRelations,
  challengeRelations,
  moderationQueueRelations,
};
