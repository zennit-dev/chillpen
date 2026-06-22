"use server";

import { and, eq, inArray } from "drizzle-orm";
import { unique } from "@/utils/array";
import { schema } from "../database";
import type { LeaderboardEntry } from "../database/schema";
import { withContext } from "../utils/context";
import { Environment } from "../utils/environment";
import type { Document } from "../utils/repository";
import { repository } from "../utils/repository";
import * as Universe from "./universe";
import * as User from "./user";

export const { get, find, create, update } = repository(
  schema.leaderboardSnapshot,
);

export type Type = Document<typeof schema.leaderboardSnapshot>;

export const bySnapshot = withContext(
  async (_, input: { scope: string; period: string }) => {
    const snapshots = await find(Environment.SERVER, {
      where: and(
        eq(schema.leaderboardSnapshot.scope, input.scope),
        eq(schema.leaderboardSnapshot.period, input.period),
      ),
      limit: 1,
    });
    if (!snapshots.success) return snapshots;
    return { success: true as const, data: snapshots.data[0] ?? null };
  },
  "Leaderboard.bySnapshot",
);

export type WriterStanding = {
  user: string;
  pseudonym: string;
  rank: number;
  score: number;
  reads: number;
  forks: number;
  likes: number;
  universes: number;
  image: string | null;
  badges: string[];
};

/**
 * The Writer Leaderboard — authors ranked by reader love (reads + forks×3 +
 * likes×2), with per-writer aggregates for the ranked list. Optionally filtered
 * to a single genre.
 */
export const topWriters = withContext(
  async (_, { size = 25, genre }: { size?: number; genre?: string } = {}) => {
    const universes = await Universe.find(Environment.SERVER, {
      where: eq(schema.universe.status, "published"),
      limit: 300,
    });
    if (!universes.success) return universes;

    const pool = genre
      ? universes.data.filter((universe) => universe.genres.includes(genre))
      : universes.data;

    const authorIds = unique(
      pool.map((universe) => universe.originatingAuthorId),
    );
    const aggregates = Object.fromEntries(
      authorIds.map((id) => {
        const owned = pool.filter(
          (universe) => universe.originatingAuthorId === id,
        );
        const reads = owned.reduce((sum, entry) => sum + entry.readCount, 0);
        const forks = owned.reduce((sum, entry) => sum + entry.forkCount, 0);
        const likes = owned.reduce((sum, entry) => sum + entry.likeCount, 0);
        return [
          id,
          {
            reads,
            forks,
            likes,
            universes: owned.length,
            score: reads + forks * 3 + likes * 2,
          },
        ];
      }),
    );

    const authors =
      authorIds.length > 0
        ? await User.find(Environment.SERVER, {
            where: inArray(schema.user.id, authorIds),
          })
        : { success: true as const, data: [] as User.Type[] };
    if (!authors.success) return authors;

    const ranked = authors.data
      .map((author) => {
        const totals = aggregates[author.id] ?? {
          reads: 0,
          forks: 0,
          likes: 0,
          universes: 0,
          score: 0,
        };
        return {
          user: author.id,
          pseudonym: author.pseudonym ?? author.name,
          image: author.image,
          badges: author.badges,
          ...totals,
        };
      })
      .sort((first, second) => second.score - first.score)
      .slice(0, size)
      .map((entry, index): WriterStanding => ({ ...entry, rank: index + 1 }));

    return { success: true as const, data: ranked };
  },
  "Leaderboard.topWriters",
);

/** Live "rising writers" — authors ranked by recent read/fork/like velocity. */
export const risingWriters = withContext(
  async (_, { size = 10 }: { size?: number } = {}) => {
    const universes = await Universe.find(Environment.SERVER, {
      where: eq(schema.universe.status, "published"),
      limit: 200,
    });
    if (!universes.success) return universes;

    const authorIds = unique(
      universes.data.map((universe) => universe.originatingAuthorId),
    );
    const scores = Object.fromEntries(
      authorIds.map((id) => [
        id,
        universes.data
          .filter((universe) => universe.originatingAuthorId === id)
          .reduce(
            (sum, universe) =>
              sum +
              universe.readCount +
              universe.forkCount * 3 +
              universe.likeCount * 2,
            0,
          ),
      ]),
    );

    const authors =
      authorIds.length > 0
        ? await User.find(Environment.SERVER, {
            where: inArray(schema.user.id, authorIds),
          })
        : { success: true as const, data: [] as User.Type[] };
    if (!authors.success) return authors;

    const ranked = authors.data
      .map((author) => ({
        user: author.id,
        pseudonym: author.pseudonym ?? author.name,
        score: scores[author.id] ?? 0,
        followers: author.followerCount,
      }))
      .sort((first, second) => second.score - first.score)
      .slice(0, size)
      .map(
        (entry, index): LeaderboardEntry => ({
          user: entry.user,
          pseudonym: entry.pseudonym,
          score: entry.score,
          rank: index + 1,
        }),
      );

    return { success: true as const, data: ranked };
  },
  "Leaderboard.risingWriters",
);
