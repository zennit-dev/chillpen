"use server";

import { and, eq } from "drizzle-orm";
import { schema, type TransactionScope, withTransaction } from "../database";
import { withAuthentication } from "../utils/authentication";
import { Environment } from "../utils/environment";
import { type Document, increment, repository } from "../utils/repository";

export const { find, create, destroy } = repository(schema.follow);

export type Type = Document<typeof schema.follow>;

export const toggle = withAuthentication(
  async (context, { writer }: { writer: string }) => {
    if (writer === context.session.user.id)
      return {
        success: false as const,
        error: new Error("cannot-follow-self"),
      };

    const existing = await find(Environment.SERVER, {
      where: and(
        eq(schema.follow.followerId, context.session.user.id),
        eq(schema.follow.followingId, writer),
      ),
      limit: 1,
    });
    if (!existing.success) return existing;

    const current = existing.data[0];
    const direction = current ? -1 : 1;

    return withTransaction(async (tx: TransactionScope) => {
      if (current) await destroy(Environment.SERVER, current.id, { tx });
      else
        await create(
          Environment.SERVER,
          { followerId: context.session.user.id, followingId: writer },
          { tx },
        );

      await increment(Environment.SERVER, schema.user, writer, {
        column: schema.user.followerCount,
        by: direction,
        tx,
      });
      await increment(
        Environment.SERVER,
        schema.user,
        context.session.user.id,
        {
          column: schema.user.followingCount,
          by: direction,
          tx,
        },
      );

      return { success: true as const, data: { following: !current } };
    });
  },
  "Follow.toggle",
);

export const isFollowing = withAuthentication(
  async (context, { writer }: { writer: string }) => {
    const existing = await find(Environment.SERVER, {
      where: and(
        eq(schema.follow.followerId, context.session.user.id),
        eq(schema.follow.followingId, writer),
      ),
      limit: 1,
    });
    if (!existing.success) return existing;
    return { success: true as const, data: Boolean(existing.data[0]) };
  },
  "Follow.isFollowing",
);
