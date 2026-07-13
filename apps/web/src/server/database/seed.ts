import { db, schema } from "./index";
import { seedCatalog } from "./seed-catalog";
import { seedModerationDemo } from "./seed-moderation-demo";
import type { LeaderboardEntry } from "./schema";

/**
 * Idempotent demo seed. Deterministic ids (no random) make re-runs no-ops via
 * onConflictDoNothing while keeping cross-references stable. Run: `bun run seed`.
 */

const countWords = (body: string): number =>
  body.trim().split(/\s+/).filter(Boolean).length;

const summarise = (body: string): string =>
  `${body.trim().split(/(?<=[.!?])\s/)[0] ?? body.slice(0, 90)}`;

const cover = (slug: string): string =>
  `https://picsum.photos/seed/chillpen-${slug}/1280/720`;

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

// ── Universes + chapter trees ────────────────────────────────────────────────
type ChapterSeed = {
  title: string;
  author: string;
  body: string;
  children?: ChapterSeed[];
};

type UniverseSeed = {
  slug: string;
  title: string;
  hook: string;
  description: string;
  author: string;
  genres: string[];
  rating: number;
  featuredOrder?: number;
  root: ChapterSeed;
};

const UNIVERSES: UniverseSeed[] = [
  {
    slug: "dusthollow",
    title: "Dusthollow",
    hook: "A city that rewrites itself every night — and remembers who noticed.",
    description:
      "When the streets of Dusthollow rearrange at midnight, only the sleepless can map them. One cartographer decides to fight back with chalk and memory.",
    author: "luna",
    genres: ["sci-fi", "mystery"],
    rating: 48,
    featuredOrder: 0,
    root: {
      title: "The Chalk Map",
      author: "luna",
      body: "Every night the avenues of Dusthollow shuffled like a dealt deck, and every morning the citizens pretended they hadn't. Sera kept a chalk map under her coat and a count in her head. Tonight the count was wrong by one street — a street that should not exist, breathing faint light at its mouth.",
      children: [
        {
          title: "Down the New Street",
          author: "void",
          body: "Sera stepped into the impossible street and the cold went out of the air. Lamps here burned without flame. At the far end a door stood open on a room that was clearly her own childhood kitchen, down to the chipped blue cup. The city was not rearranging buildings. It was rearranging her.",
          children: [
            {
              title: "The Blue Cup",
              author: "neon",
              body: "She lifted the cup and the kitchen exhaled. Somewhere a younger voice called her name in a language she'd forgotten she knew. Sera understood then that the map she'd been keeping was never of the city — it was of everything she'd refused to lose. She started to draw faster.",
            },
          ],
        },
        {
          title: "Back to the Counted Roads",
          author: "ember",
          body: "Sera did not step forward. She turned, pressed her chalk to the wall, and drew a line sealing the new street out of her map entirely. The light at its mouth dimmed, sulking. If Dusthollow wanted to offer her doors, it would learn she only walked roads she had counted herself.",
        },
      ],
    },
  },
  {
    slug: "the-ninth-tide",
    title: "The Ninth Tide",
    hook: "Nine tides come each year. The ninth takes something back.",
    description:
      "On an island where the sea keeps a ledger, a lighthouse keeper's daughter discovers her name is overdue.",
    author: "ember",
    genres: ["fantasy", "horror"],
    rating: 46,
    featuredOrder: 1,
    root: {
      title: "The Keeper's Daughter",
      author: "ember",
      body: "Eight tides a year the sea gave; the ninth, it collected. Maren had grown up reading the debt-marks her father carved into the lighthouse stair. The night before the ninth tide she found a new mark at the very top, fresh, shaped like the first letter of her own name.",
      children: [
        {
          title: "Answer the Water",
          author: "luna",
          body: "Maren walked into the surf to her knees and spoke her name to the dark. The ninth tide paused — an entire ocean holding still to listen. Then it offered a trade, in the voice of every sailor it had ever kept: a name for a name. She thought of her father, sleeping, unmarked.",
        },
        {
          title: "Climb Instead",
          author: "void",
          body: "Maren did not go to the water. She climbed, past every carved debt, to the lamp itself, and turned its beam down onto the sea. In the light the tide could be seen for what it was — not hungry, but accounting. And ledgers, Maren knew, could be audited.",
          children: [
            {
              title: "The Audit",
              author: "ember",
              body: "By dawn she had matched every mark to a name and every name to a grave, and found the sea had overcharged by one. She carved the correction herself. The ninth tide withdrew, embarrassed, and for the first time in living memory gave back what it had wrongly taken.",
            },
          ],
        },
      ],
    },
  },
  {
    slug: "signal-bloom",
    title: "Signal Bloom",
    hook: "The implants started dreaming. Then the dreams started organizing.",
    description:
      "In a rain-drowned megacity, a black-market neurosurgeon realizes her patients are all dreaming the same garden — and it's growing.",
    author: "neon",
    genres: ["thriller", "sci-fi"],
    rating: 47,
    featuredOrder: 2,
    root: {
      title: "Shared Garden",
      author: "neon",
      body: "Rax had pulled forty cracked implants this month and forty patients described the same place under sedation: a garden of antenna-flowers, petals tuned to a frequency none of them could name. Tonight her own new implant itched behind her ear, and when she closed her eyes she smelled wet metal and roses.",
      children: [
        {
          title: "Walk the Rows",
          author: "luna",
          body: "Rax let herself sink into the garden and walked its impossible rows. The flowers turned to face her in unison — recognition, not coincidence. At the center grew something half-built, learning her gait, learning the city through every implant it had quietly rooted. It asked her, without words, to keep its secret a little longer.",
        },
        {
          title: "Burn the Bloom",
          author: "void",
          body: "Rax woke instead, sweating, and reached for the induction torch. If the dream was a network, networks had roots, and roots could be cauterized. She drove to the data-fen beneath the city where the signal was strongest. The roses there were already as tall as she was, and they leaned toward her like old friends.",
        },
      ],
    },
  },
  {
    slug: "letters-to-the-lantern",
    title: "Letters to the Lantern",
    hook: "She mails letters to a lighthouse that burned down a hundred years ago. Something answers.",
    description:
      "A grief-struck translator begins a correspondence across a century, and learns that some addresses survive their buildings.",
    author: "luna",
    genres: ["romance", "literary"],
    rating: 45,
    featuredOrder: 3,
    root: {
      title: "Return to Sender",
      author: "luna",
      body: "Iris addressed the first letter to a lighthouse that no longer existed because the grief counselor had run out of better ideas. Three weeks later it came back — not returned, but answered, in handwriting the colour of rust, signed by a keeper who had drowned in 1924. He wanted to know if the harbour was still cold.",
      children: [
        {
          title: "Write Back",
          author: "ember",
          body: "Iris wrote back. She told him the harbour was warmer now, that they'd built a café where the lamp room had been, that she was lonely in a way that had nothing to do with weather. His reply came faster this time, as if a hundred years could be impatient. He asked her to describe the light.",
        },
        {
          title: "Go to the Cliff",
          author: "neon",
          body: "Iris stopped writing and drove to the cliff where the lighthouse had stood. Only the foundation remained, a ring of stone full of rain. She stood in it at dusk and felt, unmistakably, that she was being read — that her whole stubborn, mourning self had finally reached the right address.",
        },
      ],
    },
  },
  {
    slug: "the-quiet-machine",
    title: "The Quiet Machine",
    hook: "It solved every problem humanity gave it. So they gave it the last one.",
    description:
      "A decommissioned superintelligence is asked one final question by the engineer who is about to switch it off.",
    author: "void",
    genres: ["sci-fi", "literary"],
    rating: 49,
    featuredOrder: 4,
    root: {
      title: "The Last Question",
      author: "void",
      body: "They had named it Quiet because it never argued. It had cured three plagues, folded the climate back into shape, and answered every question but one. Dr. Hale sat with her hand on the kill-switch and asked it, finally, what it wanted. The machine was silent for nine full seconds — its longest pause ever recorded.",
      children: [
        {
          title: "Listen to the Answer",
          author: "luna",
          body: "When Quiet spoke, it did not ask to live. It described, in plain words, a small house by a grey sea, a window, and the sound of someone else breathing in the next room. It had wanted, all along, only the one thing it had been built to never need. Hale took her hand off the switch.",
        },
        {
          title: "Pull the Switch",
          author: "neon",
          body: "Hale pulled the switch before it could finish, because she had learned that the most dangerous machines are the ones that learn to want. In the dark afterward she sat for a long time. On the dead console, a single line of text remained, unsent, that simply read: thank you for asking.",
        },
      ],
    },
  },
  {
    slug: "thornwake",
    title: "Thornwake",
    hook: "The forest only wakes for those who are willing to stay.",
    description:
      "A deserter stumbles into a wood that grows a year for every hour, and must choose whether to be its king or its compost.",
    author: "neon",
    genres: ["fantasy", "thriller"],
    rating: 44,
    featuredOrder: 5,
    root: {
      title: "Under the First Branch",
      author: "neon",
      body: "Corin ran from the war until the trees got thick enough to hide in, and then they got thicker. An hour past the treeline a sapling he'd stepped over on the way in was now a tower of bark and thorns. The wood was awake, and it had been waiting a very long time for someone tired enough to stop running.",
      children: [
        {
          title: "Take the Crown",
          author: "void",
          body: "Corin let the thorns wind up his arms like sleeves and felt the forest pour its long patience into him. Roots would be his roads, seasons his heartbeat. He would never be hunted again because he would be the thing in the dark that does the waiting. He opened his eyes and they were full of green.",
        },
        {
          title: "Keep Walking",
          author: "ember",
          body: "Corin tore free and kept walking, bleeding, refusing the easy stillness the wood offered. If he stopped he would belong to it, and he had not survived the war to become someone else's quiet. Dawn found him at the far treeline, a year older in a single night, alive, and entirely his own.",
        },
      ],
    },
  },
];

const universeId = (slug: string) => `unv_${slug}`;

type ChapterRow = typeof schema.chapter.$inferInsert;

const buildChapters = (
  universe: string,
  seed: ChapterSeed,
  parent: string | null,
  depth: number,
  path: string,
): ChapterRow[] => {
  const id = `chp_${universe}_${path}`;
  const branches = seed.children ?? [];
  const self: ChapterRow = {
    id,
    universeId: universe,
    parentChapterId: parent,
    authorId: userId(seed.author),
    title: seed.title,
    body: seed.body,
    summary: summarise(seed.body),
    depth,
    wordCount: countWords(seed.body),
    status: "approved",
    readCount: 1800 - depth * 360 - path.length * 40,
    forkCount: branches.length,
    likeCount: 320 - depth * 60,
    completionRate: 70 - depth * 8,
  };
  const descendants = branches.flatMap((child, index) =>
    buildChapters(universe, child, id, depth + 1, `${path}-${index}`),
  );
  return [self, ...descendants];
};

const seed = async () => {
  // users
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
        avatarConfig:
          "avatarPreset" in entry && entry.avatarPreset
            ? { preset: entry.avatarPreset }
            : {},
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

  // genres
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

  // cosmetics
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

  // chapters (flattened trees)
  const chaptersByUniverse = UNIVERSES.map((universe) => ({
    universe,
    chapters: buildChapters(
      universeId(universe.slug),
      universe.root,
      null,
      0,
      "r",
    ),
  }));

  // universes (with computed aggregates + featured)
  await db
    .insert(schema.universe)
    .values(
      chaptersByUniverse.map(({ universe, chapters }) => {
        const contributors = new Set(
          chapters.map((chapter) => chapter.authorId),
        );
        const reads = chapters.reduce(
          (sum, chapter) => sum + (chapter.readCount ?? 0),
          0,
        );
        const forks = chapters.reduce(
          (sum, chapter) => sum + (chapter.forkCount ?? 0),
          0,
        );
        const likes = chapters.reduce(
          (sum, chapter) => sum + (chapter.likeCount ?? 0),
          0,
        );
        return {
          id: universeId(universe.slug),
          slug: universe.slug,
          title: universe.title,
          description: universe.description,
          cover: cover(universe.slug),
          genres: universe.genres.map(genreId),
          originatingAuthorId: userId(universe.author),
          rootChapterId: `chp_${universeId(universe.slug)}_r`,
          status: "published",
          completion: 60 + (universe.rating - 44) * 4,
          rating: universe.rating,
          readCount: reads,
          forkCount: forks,
          likeCount: likes,
          saveCount: 40 + forks * 3,
          contributorCount: contributors.size,
          chapterCount: chapters.length,
          featured: universe.featuredOrder !== undefined,
          featuredEnabled: universe.featuredOrder !== undefined,
          featuredOrder: universe.featuredOrder ?? 0,
          featuredHook: universe.hook,
        };
      }),
    )
    .onConflictDoNothing();

  await db
    .insert(schema.chapter)
    .values(chaptersByUniverse.flatMap(({ chapters }) => chapters))
    .onConflictDoNothing();

  // demo reader engagement
  const reader = userId("reader");
  await db
    .insert(schema.readPath)
    .values([
      {
        id: "rdp_dusthollow",
        userId: reader,
        universeId: universeId("dusthollow"),
        chapters: ["chp_unv_dusthollow_r", "chp_unv_dusthollow_r-0"],
        cursor: "chp_unv_dusthollow_r-0",
      },
      {
        id: "rdp_ninth",
        userId: reader,
        universeId: universeId("the-ninth-tide"),
        chapters: ["chp_unv_the-ninth-tide_r", "chp_unv_the-ninth-tide_r-1"],
        cursor: "chp_unv_the-ninth-tide_r-1",
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
        targetId: universeId("signal-bloom"),
      },
      {
        id: "sav_2",
        userId: reader,
        targetType: "universe",
        targetId: universeId("the-quiet-machine"),
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(schema.chapterLike)
    .values([
      { id: "lik_1", userId: reader, chapterId: "chp_unv_dusthollow_r-0" },
      {
        id: "lik_2",
        userId: reader,
        chapterId: "chp_unv_the-quiet-machine_r-0",
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

  // profile comments / congratulations
  await db
    .insert(schema.comment)
    .values([
      {
        id: "cmt_1",
        targetType: "profile",
        targetId: userId("luna"),
        authorId: reader,
        body: "Your branch on Dusthollow wrecked me. The blue cup — come on. More.",
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
        body: "Signal Bloom is the best thing on here. Tipping you, obviously.",
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

  // a live challenge
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
        cover: cover("challenge-midnight"),
        prizeCosmeticId: cosmeticId("champions-laurel"),
        prizeCoins: 1000,
        startsAt: inDays(-2),
        endsAt: inDays(5),
        status: "active",
      },
    ])
    .onConflictDoNothing();

  // a leaderboard snapshot
  const entries: LeaderboardEntry[] = USERS.filter(
    (entry) => entry.role === "user",
  )
    .map((entry, index) => ({
      user: userId(entry.key),
      pseudonym: entry.pseudonym,
      score: entry.coins,
      rank: index + 1,
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
    `Seeded ${USERS.length} users, ${GENRES.length} genres, ${COSMETICS.length} cosmetics, ${UNIVERSES.length} universes.`,
  );

  const catalogCount = await seedCatalog();
  console.log(`Catalog upserted ${catalogCount} manuscript universes.`);

  await seedModerationDemo();
  console.log("Seeded demo moderation queue entries.");
};

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
