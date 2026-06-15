"use server";

import { and, eq, inArray } from "drizzle-orm";
import { unique } from "@/utils/array";
import { schema, type TransactionScope, withTransaction } from "../database";
import { withAuthentication } from "../utils/authentication";
import { withAuthorization } from "../utils/authorization";
import { withContext } from "../utils/context";
import { Environment } from "../utils/environment";
import type { Document } from "../utils/repository";
import { repository } from "../utils/repository";
import * as Coin from "./coin";
import * as User from "./user";

export const { get, find, create, update, destroy } = repository(
  schema.cosmetic,
);

const owned = repository(schema.userCosmetic);

export type Type = Document<typeof schema.cosmetic>;
export type Owned = Document<typeof schema.userCosmetic>;
export type OwnedCosmetic = Owned & { cosmetic: Type | null };

export const shop = withContext(async () => {
  const cosmetics = await find(Environment.SERVER, {
    where: and(
      eq(schema.cosmetic.shopDisabled, false),
      eq(schema.cosmetic.retired, false),
    ),
    orderBy: [{ column: schema.cosmetic.price, direction: "asc" }],
  });
  if (!cosmetics.success) return cosmetics;

  const now = Date.now();
  const live = cosmetics.data.filter(
    (item) =>
      (!item.dropStartsAt || item.dropStartsAt.getTime() <= now) &&
      (!item.dropEndsAt || item.dropEndsAt.getTime() >= now),
  );
  return { success: true as const, data: live };
}, "Cosmetic.shop");

export const purchase = withAuthentication(
  async (context, { cosmetic: id }: { cosmetic: string }) => {
    const cosmetic = await get(Environment.SERVER, id);
    if (!cosmetic.success) return cosmetic;
    if (!cosmetic.data)
      return {
        success: false as const,
        error: new Error("cosmetic-not-found"),
      };
    if (cosmetic.data.shopDisabled || cosmetic.data.price === null)
      return { success: false as const, error: new Error("not-purchasable") };

    const existing = await owned.find(Environment.SERVER, {
      where: and(
        eq(schema.userCosmetic.userId, context.session.user.id),
        eq(schema.userCosmetic.cosmeticId, id),
      ),
      limit: 1,
    });
    if (!existing.success) return existing;
    if (existing.data[0])
      return { success: false as const, error: new Error("already-owned") };

    const price = cosmetic.data.price;
    return withTransaction(async (tx: TransactionScope) => {
      const spent = await Coin.award(Environment.SERVER, {
        user: context.session.user.id,
        delta: -price,
        reason: "cosmetic_purchase",
        referenceType: "cosmetic",
        referenceId: id,
        tx,
      });
      if (!spent.success) return spent;

      return owned.create(
        Environment.SERVER,
        {
          userId: context.session.user.id,
          cosmeticId: id,
          source: "purchase",
        },
        { tx },
      );
    });
  },
  "Cosmetic.purchase",
);

export const equip = withAuthentication(
  async (context, { cosmetic: id }: { cosmetic: string }) => {
    const cosmetic = await get(Environment.SERVER, id);
    if (!cosmetic.success) return cosmetic;
    if (!cosmetic.data)
      return {
        success: false as const,
        error: new Error("cosmetic-not-found"),
      };

    const ownership = await owned.find(Environment.SERVER, {
      where: and(
        eq(schema.userCosmetic.userId, context.session.user.id),
        eq(schema.userCosmetic.cosmeticId, id),
      ),
      limit: 1,
    });
    if (!ownership.success) return ownership;
    if (!ownership.data[0])
      return { success: false as const, error: new Error("not-owned") };

    const account = await User.get(Environment.SERVER, context.session.user.id);
    if (!account.success) return account;
    if (!account.data)
      return { success: false as const, error: new Error("user-not-found") };

    const config = { ...account.data.avatarConfig };
    const asset = cosmetic.data.asset;
    const next = (() => {
      switch (cosmetic.data.type) {
        case "frame":
          return { ...config, frame: asset };
        case "effect":
          return { ...config, effect: asset };
        default:
          return {
            ...config,
            items: [...new Set([...(config.items ?? []), asset])],
          };
      }
    })();

    const updated = await User.update(Environment.SERVER, account.data.id, {
      avatarConfig: next,
    });
    if (!updated.success) return updated;
    return { success: true as const, data: next };
  },
  "Cosmetic.equip",
);

export const inventory = withAuthentication(async (context) => {
  const ownerships = await owned.find(Environment.SERVER, {
    where: eq(schema.userCosmetic.userId, context.session.user.id),
    orderBy: [{ column: schema.userCosmetic.createdAt, direction: "desc" }],
  });
  if (!ownerships.success) return ownerships;

  const ids = unique(ownerships.data.map((entry) => entry.cosmeticId));
  const cosmetics =
    ids.length > 0
      ? await find(Environment.SERVER, {
          where: inArray(schema.cosmetic.id, ids),
        })
      : { success: true as const, data: [] as Type[] };

  const map = cosmetics.success
    ? new Map(cosmetics.data.map((item) => [item.id, item]))
    : new Map<string, Type>();

  return {
    success: true as const,
    data: ownerships.data.map(
      (entry): OwnedCosmetic => ({
        ...entry,
        cosmetic: map.get(entry.cosmeticId) ?? null,
      }),
    ),
  };
}, "Cosmetic.inventory");

export const grant = withAuthorization(
  ["admin"],
  async (_, input: { user: string; cosmetic: string; source?: string }) => {
    const existing = await owned.find(Environment.SERVER, {
      where: and(
        eq(schema.userCosmetic.userId, input.user),
        eq(schema.userCosmetic.cosmeticId, input.cosmetic),
      ),
      limit: 1,
    });
    if (!existing.success) return existing;
    if (existing.data[0])
      return { success: true as const, data: existing.data[0] };

    return owned.create(Environment.SERVER, {
      userId: input.user,
      cosmeticId: input.cosmetic,
      source: input.source ?? "won",
    });
  },
  "Cosmetic.grant",
);

export const retire = withAuthorization(
  ["admin"],
  async (_, { cosmetic: id }: { cosmetic: string }) =>
    update(Environment.SERVER, id, { retired: true }),
  "Cosmetic.retire",
);
