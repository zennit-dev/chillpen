"use server";

import { eq } from "drizzle-orm";
import { schema, type TransactionScope, withTransaction } from "../database";
import { withAuthentication } from "../utils/authentication";
import { withContext } from "../utils/context";
import { Environment } from "../utils/environment";
import type { Document } from "../utils/repository";
import { repository } from "../utils/repository";
import * as User from "./user";

export const { get, paginate, create, find } = repository(schema.coinLedger);

export type Type = Document<typeof schema.coinLedger>;

type AwardInput = {
  user: string;
  delta: number;
  reason: string;
  referenceType?: string;
  referenceId?: string;
  tx?: TransactionScope;
};

/**
 * Internal: award (or deduct) coins and append a ledger row atomically. Pass
 * `tx` to enlist in an outer transaction (chapter approval, cosmetic purchase,
 * challenge win). Not intended to be called directly from client components.
 */
export const award = withContext(async (_, input: AwardInput) => {
  const apply = async (tx: TransactionScope) => {
    const account = await User.get(Environment.SERVER, input.user, { tx });
    if (!account.success) return account;
    if (!account.data)
      return { success: false as const, error: new Error("user-not-found") };

    const balance = account.data.coins + input.delta;
    if (balance < 0)
      return {
        success: false as const,
        error: new Error("insufficient-coins"),
      };

    const updated = await User.update(
      Environment.SERVER,
      input.user,
      { coins: balance },
      { tx },
    );
    if (!updated.success) return updated;

    return create(
      Environment.SERVER,
      {
        userId: input.user,
        delta: input.delta,
        reason: input.reason,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        balanceAfter: balance,
      },
      { tx },
    );
  };

  if (input.tx) return apply(input.tx);
  return withTransaction(apply);
}, "Coin.award");

export const spend = withAuthentication(
  async (
    context,
    input: {
      amount: number;
      reason: string;
      referenceType?: string;
      referenceId?: string;
    },
  ) =>
    award(Environment.SERVER, {
      user: context.session.user.id,
      delta: -Math.abs(input.amount),
      reason: input.reason,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
    }),
  "Coin.spend",
);

/**
 * Tip a writer directly. Moves coins from the reader to the writer atomically
 * and records both ledger sides. Readers tip from a writer's profile.
 */
export const tip = withAuthentication(
  async (context, input: { to: string; amount: number }) => {
    const amount = Math.floor(Math.abs(input.amount));
    if (amount <= 0)
      return { success: false as const, error: new Error("invalid-amount") };
    if (input.to === context.session.user.id)
      return { success: false as const, error: new Error("cannot-tip-self") };

    return withTransaction(async (tx: TransactionScope) => {
      const debit = await award(Environment.SERVER, {
        user: context.session.user.id,
        delta: -amount,
        reason: "tip_sent",
        referenceType: "user",
        referenceId: input.to,
        tx,
      });
      if (!debit.success) return debit;

      const credit = await award(Environment.SERVER, {
        user: input.to,
        delta: amount,
        reason: "tip_received",
        referenceType: "user",
        referenceId: context.session.user.id,
        tx,
      });
      if (!credit.success) return credit;

      return { success: true as const, data: { amount } };
    });
  },
  "Coin.tip",
);

export const balance = withAuthentication(async (context) => {
  const account = await User.get(Environment.SERVER, context.session.user.id);
  if (!account.success) return account;
  return { success: true as const, data: { coins: account.data?.coins ?? 0 } };
}, "Coin.balance");

export const history = withAuthentication(
  async (context, { page = 1, size = 20 }: { page?: number; size?: number }) =>
    paginate(Environment.SERVER, page, size, {
      where: eq(schema.coinLedger.userId, context.session.user.id),
      orderBy: [{ column: schema.coinLedger.createdAt, direction: "desc" }],
    }),
  "Coin.history",
);
