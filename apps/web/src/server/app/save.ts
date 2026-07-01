"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schema, type TransactionScope, withTransaction } from "../database";
import { withAuthentication } from "../utils/authentication";
import { Environment } from "../utils/environment";
import { type Document, increment, repository } from "../utils/repository";

export const { get, find, create, destroy } = repository(schema.save);

export type Type = Document<typeof schema.save>;

export type SaveTarget = "universe" | "path";

export const toggle = withAuthentication(
  async (context, input: { targetType: SaveTarget; target: string }) => {
    const existing = await find(Environment.SERVER, {
      where: and(
        eq(schema.save.userId, context.session.user.id),
        eq(schema.save.targetType, input.targetType),
        eq(schema.save.targetId, input.target),
      ),
      limit: 1,
    });
    if (!existing.success) return existing;

    const current = existing.data[0];
    const direction = current ? -1 : 1;

    const outcome = await withTransaction(async (tx: TransactionScope) => {
      if (current) await destroy(Environment.SERVER, current.id, { tx });
      else
        await create(
          Environment.SERVER,
          {
            userId: context.session.user.id,
            targetType: input.targetType,
            targetId: input.target,
          },
          { tx },
        );

      if (input.targetType === "universe")
        await increment(Environment.SERVER, schema.universe, input.target, {
          column: schema.universe.saveCount,
          by: direction,
          tx,
        });

      return { success: true as const, data: { saved: !current } };
    });

    // Bust the router cache for every surface that reflects saved state so the
    // Library shelf and heart icons update on the next visit.
    revalidatePath("/library");
    revalidatePath("/discover");

    return outcome;
  },
  "Save.toggle",
);

export const mine = withAuthentication(
  async (context, input: { targetType?: SaveTarget } = {}) => {
    const filter = input.targetType
      ? and(
          eq(schema.save.userId, context.session.user.id),
          eq(schema.save.targetType, input.targetType),
        )
      : eq(schema.save.userId, context.session.user.id);
    return find(Environment.SERVER, {
      where: filter,
      orderBy: [{ column: schema.save.createdAt, direction: "desc" }],
    });
  },
  "Save.mine",
);

export const savedUniverseIds = withAuthentication(async (context) => {
  const saves = await find(Environment.SERVER, {
    where: and(
      eq(schema.save.userId, context.session.user.id),
      eq(schema.save.targetType, "universe"),
    ),
  });
  if (!saves.success) return saves;
  return {
    success: true as const,
    data: saves.data.map((entry) => entry.targetId),
  };
}, "Save.savedUniverseIds");
