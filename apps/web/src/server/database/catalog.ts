import { CATALOG_BODIES } from "./catalog-bodies";

export type CatalogUniverse = {
  slug: string;
  title: string;
  hook: string;
  description: string;
  author: string;
  genres: string[];
  rating: number;
  completion: number;
  reads: number;
  forks: number;
  saves: number;
  likes: number;
  featuredOrder: number;
  cover: string;
  chapterTitle: string;
  body: string;
};

const cover = (slug: string) => {
  // Hosted on UploadThing so production next/image works even when Vercel
  // hasn't shipped apps/web/public/covers (same-origin /covers still 404s).
  const hosted = {
    "school-of-magic":
      "https://u9rfstfdyc.ufs.sh/f/TPOQCADLHQ1yIkvrwbMMwtn4SaeipOHYsFzWKNdxZ9coIGmv",
    "the-almost-love-club":
      "https://u9rfstfdyc.ufs.sh/f/TPOQCADLHQ1yuwyJusPkBi12fhnIEHu7zSgLM56jGWKxoywF",
    rikimaru:
      "https://u9rfstfdyc.ufs.sh/f/TPOQCADLHQ1ySar7cHlOxWqsKpSvMDbCh7GkIaTV0iRjn4yF",
    "the-norwegian-beast":
      "https://u9rfstfdyc.ufs.sh/f/TPOQCADLHQ1y119iRQjL6r85FVWqQ1YGydc2AwRKhSn4tlb3",
  } as const;
  return hosted[slug as keyof typeof hosted] ?? `/covers/${slug}.jpg`;
};

/** Manuscript universes from the chillpen prototype — full first-chapter texts. */
export const CATALOG_UNIVERSES: CatalogUniverse[] = [
  {
    slug: "school-of-magic",
    title: "School of Magic",
    hook: "An island the world forgot, where ancient Greek magic never ended — and the island chooses who arrives.",
    description:
      "Dimitri wakes barefoot on white stone before a city of marble and fire. Asteri Island has brought him to the School of Magic — and it never brings anyone by accident.",
    author: "curator",
    genres: ["fantasy"],
    rating: 49,
    completion: 8,
    reads: 214,
    forks: 0,
    saves: 18,
    likes: 47,
    featuredOrder: 0,
    cover: cover("school-of-magic"),
    chapterTitle: CATALOG_BODIES["school-of-magic"].chapterTitle,
    body: CATALOG_BODIES["school-of-magic"].body,
  },
  {
    slug: "the-almost-love-club",
    title: "The Almost Love Club",
    hook: "Five women, one candlelit bar, and a club with only one rule: say the truth before it ruins your life.",
    description:
      "Amanda Vale believed every woman in New York needed a sharp coat, a sharper friend, and one place to tell the truth. The Velvet Room was that place — until the club got rules.",
    author: "curator",
    genres: ["romance", "drama"],
    rating: 48,
    completion: 6,
    reads: 186,
    forks: 0,
    saves: 14,
    likes: 39,
    featuredOrder: 1,
    cover: cover("the-almost-love-club"),
    chapterTitle: CATALOG_BODIES["the-almost-love-club"].chapterTitle,
    body: CATALOG_BODIES["the-almost-love-club"].body,
  },
  {
    slug: "rikimaru",
    title: "Rikimaru: The Prince of Shadows",
    hook: "A shadow-born prince, a forest that remembers, and a blade with a name carved in bark.",
    description:
      "Hunted through a living forest by something older than any clan, Rikimaru learns why the shadows chose him — and what they want back.",
    author: "curator",
    genres: ["fantasy", "thriller"],
    rating: 47,
    completion: 7,
    reads: 158,
    forks: 0,
    saves: 11,
    likes: 33,
    featuredOrder: 2,
    cover: cover("rikimaru"),
    chapterTitle: CATALOG_BODIES.rikimaru.chapterTitle,
    body: CATALOG_BODIES.rikimaru.body,
  },
  {
    slug: "the-norwegian-beast",
    title: "The Norwegian Beast",
    hook: "A wild beast from Norway, released to conquer the world — one goal at a time.",
    description:
      "There are many dangerous creatures in Norway. None of them compare to the one wearing the number nine.",
    author: "curator",
    genres: ["satire", "drama"],
    rating: 46,
    completion: 5,
    reads: 132,
    forks: 0,
    saves: 9,
    likes: 28,
    featuredOrder: 3,
    cover: cover("the-norwegian-beast"),
    chapterTitle: CATALOG_BODIES["the-norwegian-beast"].chapterTitle,
    body: CATALOG_BODIES["the-norwegian-beast"].body,
  },
];
