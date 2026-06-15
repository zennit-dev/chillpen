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
