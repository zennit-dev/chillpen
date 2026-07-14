import { db, schema } from "./index";
import type { LeaderboardEntry } from "./schema";
import { ADMIN_EMAIL, ADMIN_PASSWORD, seedAdminAuth } from "./seed-admin-auth";
import { seedAvatarWallets } from "./seed-avatar-wallets";
import { seedCatalog } from "./seed-catalog";
import { seedModerationDemo } from "./seed-moderation-demo";
import { purgeLegacyUniverses } from "./seed-purge-legacy";

/**
 * Idempotent demo seed. Deterministic ids (no random) make re-runs no-ops via
 * onConflictDoNothing while keeping cross-references stable. Run: `bun run seed`.
 */

const cover = (slug: string) => `/covers/${slug}.jpg`;

// ── Users ────────────────────────────────────────────────────────────────────
const USERS = [
  {
    key: "curator",
    name: "Mara",
    surname: "Vance",
    pseudonym: "curator",
    role: "admin",
    coins: 5000,
    bio: "Keeper of the catalog.",
  },
  {
    key: "luna",
    name: "Luna",
    surname: "Ink",
    pseudonym: "LunaInk",
    role: "user",
    coins: 1240,
    bio: "Worldsmith. I leave doors open.",
  },
  {
    key: "void",
    name: "Vex",
    surname: "Orr",
    pseudonym: "VoidWriter",
    role: "user",
    coins: 880,
    bio: "I write the endings nobody asks for.",
  },
  {
    key: "neon",
    name: "Nia",
    surname: "Fox",
    pseudonym: "NeonFox",
    role: "user",
    coins: 660,
    bio: "Neon and rain. Always rain.",
  },
  {
    key: "ember",
    name: "Emil",
    surname: "Quill",
    pseudonym: "EmberQuill",
    role: "user",
    coins: 430,
    bio: "Slow burns and long roads.",
  },
  {
    key: "reader",
    name: "Demo",
    surname: "Reader",
    pseudonym: "wanderer",
    role: "user",
    coins: 240,
    bio: "Just here for the branches — and now writing my own.",
    avatarPreset: "bird",
  },
] as const;

const userId = (key: string) => `usr_${key}`;
const universeId = (slug: string) => `unv_${slug}`;
const chapterId = (slug: string) => `chp_${universeId(slug)}_r`;

// ── Genres ───────────────────────────────────────────────────────────────────
const GENRES = [
  { slug: "sci-fi", name: "Sci-Fi", accent: "#60a5fa" },
  { slug: "fantasy", name: "Fantasy", accent: "#a855f7" },
  { slug: "thriller", name: "Thriller", accent: "#f97316" },
  { slug: "horror", name: "Horror", accent: "#ef4444" },
  { slug: "romance", name: "Romance", accent: "#ec4899" },
  { slug: "mystery", name: "Mystery", accent: "#22d3ee" },
  { slug: "historical", name: "Historical", accent: "#d4a373" },
  { slug: "literary", name: "Literary", accent: "#94a3b8" },
  { slug: "satire", name: "Satire", accent: "#e8b45a" },
  { slug: "drama", name: "Drama", accent: "#f472b6" },
] as const;

const genreId = (slug: string) => `gnr_${slug}`;

// ── Cosmetics ────────────────────────────────────────────────────────────────
const COSMETICS = [
  {
    slug: "gilded-frame",
    name: "Gilded Frame",
    type: "frame",
    rarity: "common",
    price: 200,
    shopDisabled: false,
  },
  {
    slug: "ink-halo",
    name: "Ink Halo",
    type: "effect",
    rarity: "common",
    price: 260,
    shopDisabled: false,
  },
  {
    slug: "neon-rim",
    name: "Neon Rim",
    type: "frame",
    rarity: "rare",
    price: 600,
    shopDisabled: false,
  },
  {
    slug: "starfall",
    name: "Starfall Effect",
    type: "effect",
    rarity: "rare",
    price: 720,
    shopDisabled: false,
  },
  {
    slug: "obsidian-crown",
    name: "Obsidian Crown",
    type: "avatar_item",
    rarity: "rare",
    price: 900,
    shopDisabled: false,
  },
  {
    slug: "molten-sigil",
    name: "Molten Sigil",
    type: "avatar_item",
    rarity: "rare",
    price: 840,
    shopDisabled: false,
  },
  {
    slug: "first-light",
    name: "First Light Frame",
    type: "frame",
    rarity: "legendary",
    price: 2400,
    shopDisabled: false,
  },
  {
    slug: "aurora-veil",
    name: "Aurora Veil",
    type: "effect",
    rarity: "legendary",
    price: null,
    shopDisabled: true,
  },
  {
    slug: "champions-laurel",
    name: "Champion's Laurel",
    type: "avatar_item",
    rarity: "legendary",
    price: null,
    shopDisabled: true,
  },
  {
    slug: "founders-mark",
    name: "Founder's Mark",
    type: "avatar_item",
    rarity: "legendary",
    price: null,
    shopDisabled: true,
  },
  {
    slug: "ember-trail",
    name: "Ember Trail",
    type: "effect",
    rarity: "rare",
    price: 540,
    shopDisabled: false,
  },
  {
    slug: "glass-frame",
    name: "Glasswork Frame",
    type: "frame",
    rarity: "common",
    price: 180,
    shopDisabled: false,
  },
] as const;

const cosmeticId = (slug: string) => `csm_${slug}`;

const seed = async () => {
  const purged = await purgeLegacyUniverses();
  if (purged > 0)
    console.log(`Removed ${purged} legacy placeholder universes.`);

  await db
    .insert(schema.user)
    .values(
      USERS.map((entry) => ({
        id: userId(entry.key),
        name: entry.name,
        surname: entry.surname,
        email: `${entry.key}@chillpen.club`,
        emailVerified: true,
        pseudonym: entry.pseudonym,
        role: entry.role,
        coins: entry.coins,
        bio: entry.bio,
        avatarConfig: {
          preset:
            "avatarPreset" in entry && entry.avatarPreset
              ? entry.avatarPreset
              : "bird",
          ownedAvatars: ["bird"],
          ownedItems: [],
          equipped: {},
        },
        subscriptionStatus: "active",
        badges:
          entry.role === "admin"
            ? ["curator"]
            : entry.coins > 800
              ? ["rising-writer"]
              : [],
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(schema.genre)
    .values(
      GENRES.map((entry) => ({
        id: genreId(entry.slug),
        slug: entry.slug,
        name: entry.name,
        accent: entry.accent,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(schema.cosmetic)
    .values(
      COSMETICS.map((entry) => ({
        id: cosmeticId(entry.slug),
        slug: entry.slug,
        name: entry.name,
        type: entry.type,
        rarity: entry.rarity,
        asset: `/cosmetics/${entry.slug}.svg`,
        price: entry.price,
        shopDisabled: entry.shopDisabled,
      })),
    )
    .onConflictDoNothing();

  await seedAdminAuth();
  const wallets = await seedAvatarWallets();
  console.log(`Synced avatar wallets for ${wallets} users.`);
  console.log(
    `Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} (sign in at /sign-in, then /admin)`,
  );

  const catalogCount = await seedCatalog();
  console.log(`Catalog upserted ${catalogCount} manuscript universes.`);

  await seedModerationDemo();
  console.log("Seeded demo moderation queue entries.");

  const reader = userId("reader");
  await db
    .insert(schema.readPath)
    .values([
      {
        id: "rdp_school",
        userId: reader,
        universeId: universeId("school-of-magic"),
        chapters: [chapterId("school-of-magic")],
        cursor: chapterId("school-of-magic"),
      },
      {
        id: "rdp_club",
        userId: reader,
        universeId: universeId("the-almost-love-club"),
        chapters: [chapterId("the-almost-love-club")],
        cursor: chapterId("the-almost-love-club"),
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(schema.save)
    .values([
      {
        id: "sav_1",
        userId: reader,
        targetType: "universe",
        targetId: universeId("rikimaru"),
      },
      {
        id: "sav_2",
        userId: reader,
        targetType: "universe",
        targetId: universeId("the-norwegian-beast"),
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(schema.chapterLike)
    .values([
      {
        id: "lik_1",
        userId: reader,
        chapterId: chapterId("school-of-magic"),
      },
      {
        id: "lik_2",
        userId: reader,
        chapterId: chapterId("rikimaru"),
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(schema.follow)
    .values([
      { id: "flw_1", followerId: reader, followingId: userId("luna") },
      { id: "flw_2", followerId: reader, followingId: userId("neon") },
    ])
    .onConflictDoNothing();

  await db
    .insert(schema.comment)
    .values([
      {
        id: "cmt_1",
        targetType: "profile",
        targetId: userId("luna"),
        authorId: reader,
        body: "School of Magic wrecked me. Miranda and the squirrel — come on. More.",
      },
      {
        id: "cmt_2",
        targetType: "profile",
        targetId: userId("luna"),
        authorId: userId("neon"),
        body: "Master of the open door. You always leave room for the rest of us to play.",
      },
      {
        id: "cmt_3",
        targetType: "profile",
        targetId: userId("neon"),
        authorId: reader,
        body: "The Second Bell of Asteri is going to be incredible. Tipping you, obviously.",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(schema.coinLedger)
    .values([
      {
        id: "led_1",
        userId: userId("luna"),
        delta: 50,
        reason: "chapter_published",
        balanceAfter: 1240,
      },
      {
        id: "led_2",
        userId: userId("neon"),
        delta: 50,
        reason: "chapter_published",
        balanceAfter: 660,
      },
      {
        id: "led_3",
        userId: reader,
        delta: 20,
        reason: "milestone",
        balanceAfter: 240,
      },
    ])
    .onConflictDoNothing();

  const inDays = (days: number) =>
    new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await db
    .insert(schema.challenge)
    .values([
      {
        id: "chl_midnight",
        slug: "midnight-cartography",
        title: "Midnight Cartography",
        prompt:
          "Branch any chapter where a character maps something impossible.",
        cover: cover("school-of-magic"),
        prizeCosmeticId: cosmeticId("champions-laurel"),
        prizeCoins: 1000,
        startsAt: inDays(-2),
        endsAt: inDays(5),
        status: "active",
      },
    ])
    .onConflictDoNothing();

  const entries: LeaderboardEntry[] = USERS.filter(
    (entry) => entry.role === "user",
  )
    .map((entry) => ({
      user: userId(entry.key),
      pseudonym: entry.pseudonym,
      score: entry.coins,
      rank: 0,
    }))
    .sort((first, second) => second.score - first.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  await db
    .insert(schema.leaderboardSnapshot)
    .values([
      {
        id: "lbd_global",
        scope: "global",
        period: "all-time",
        entries,
      },
    ])
    .onConflictDoNothing();

  console.log(
    `Seeded ${USERS.length} users, ${GENRES.length} genres, ${COSMETICS.length} cosmetics, ${catalogCount} catalog universes.`,
  );
};

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
