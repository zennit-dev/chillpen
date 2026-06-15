"use server";

import { schema, type TransactionScope, withTransaction } from "../database";
import { withAuthorization } from "../utils/authorization";
import { withContext } from "../utils/context";
import { Environment } from "../utils/environment";
import type { Document } from "../utils/repository";
import { repository } from "../utils/repository";
import * as Coin from "./coin";
import * as Cosmetic from "./cosmetic";

export const { get, find, create, update, destroy } = repository(
  schema.challenge,
);

export type Type = Document<typeof schema.challenge>;

export const active = withContext(async () => {
  const challenges = await find(Environment.SERVER, {
    orderBy: [{ column: schema.challenge.endsAt, direction: "asc" }],
  });
  if (!challenges.success) return challenges;
  return {
    success: true as const,
    data: challenges.data.filter(
      (challenge) =>
        challenge.status === "active" || challenge.status === "upcoming",
    ),
  };
}, "Challenge.active");

export const declareWinner = withAuthorization(
  ["admin"],
  async (_, input: { challenge: string; user: string }) => {
    const challenge = await get(Environment.SERVER, input.challenge);
    if (!challenge.success) return challenge;
    if (!challenge.data)
      return {
        success: false as const,
        error: new Error("challenge-not-found"),
      };

    const prize = challenge.data;
    const result = await withTransaction(async (tx: TransactionScope) => {
      const updated = await update(
        Environment.SERVER,
        input.challenge,
        { winnerId: input.user, status: "closed" },
        { tx },
      );
      if (!updated.success) return updated;

      if (prize.prizeCoins > 0)
        await Coin.award(Environment.SERVER, {
          user: input.user,
          delta: prize.prizeCoins,
          reason: "challenge_win",
          referenceType: "challenge",
          referenceId: input.challenge,
          tx,
        });

      return { success: true as const, data: updated.data };
    });

    if (result.success && prize.prizeCosmeticId)
      await Cosmetic.grant(Environment.SERVER, {
        user: input.user,
        cosmetic: prize.prizeCosmeticId,
        source: "won",
      });

    return result;
  },
  "Challenge.declareWinner",
);
