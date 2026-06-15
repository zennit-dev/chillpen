import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import * as Universe from "@/server/app/universe";
import { Environment } from "@/server/utils/environment";
import { unique } from "@/utils/array";

const staticPaths = [
  "/",
  "/discover",
  "/leaderboards",
  "/challenges",
  "/pricing",
] as const;

export default async (): Promise<MetadataRoute.Sitemap> => {
  const base = staticPaths.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "daily" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  const universes = await Universe.trending(Environment.SERVER, { size: 200 });
  if (!universes.success) return base;

  const cards = universes.data;
  const stories = cards.map((universe) => ({
    url: absoluteUrl(`/story/${universe.slug}`),
    lastModified: universe.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const authors = unique(
    cards
      .map((universe) => universe.author)
      .filter((author): author is string => Boolean(author)),
  ).map((author) => ({
    url: absoluteUrl(`/u/${author}`),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...base, ...stories, ...authors];
};
