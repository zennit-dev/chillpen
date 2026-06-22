"use server";

import { and, eq, inArray } from "drizzle-orm";
import { unique } from "@/utils/array";
import { schema } from "../database";
import { withAuthentication } from "../utils/authentication";
import { withContext } from "../utils/context";
import { Environment } from "../utils/environment";
import type { Document } from "../utils/repository";
import { repository } from "../utils/repository";
import * as User from "./user";

export const { get, find, create, destroy, count } = repository(schema.comment);

export type Type = Document<typeof schema.comment>;

export type CommentWithAuthor = Type & {
  author: { pseudonym: string; image: string | null } | null;
};

/** Comments on a target (a writer profile or a chapter), newest first. */
export const list = withContext(
  async (_, { targetType, target }: { targetType: string; target: string }) => {
    const comments = await find(Environment.SERVER, {
      where: and(
        eq(schema.comment.targetType, targetType),
        eq(schema.comment.targetId, target),
      ),
      orderBy: [{ column: schema.comment.createdAt, direction: "desc" }],
      limit: 50,
    });
    if (!comments.success) return comments;

    const authorIds = unique(comments.data.map((entry) => entry.authorId));
    const authors =
      authorIds.length > 0
        ? await User.find(Environment.SERVER, {
            where: inArray(schema.user.id, authorIds),
          })
        : { success: true as const, data: [] as User.Type[] };

    const map = authors.success
      ? new Map(
          authors.data.map((author) => [
            author.id,
            {
              pseudonym: author.pseudonym ?? author.name,
              image: author.image,
            },
          ]),
        )
      : new Map<string, { pseudonym: string; image: string | null }>();

    return {
      success: true as const,
      data: comments.data.map(
        (entry): CommentWithAuthor => ({
          ...entry,
          author: map.get(entry.authorId) ?? null,
        }),
      ),
    };
  },
  "Comment.list",
);

export const post = withAuthentication(
  async (
    context,
    input: { targetType: string; target: string; body: string },
  ) => {
    const body = input.body.trim();
    if (body.length === 0)
      return { success: false as const, error: new Error("empty-comment") };

    return create(Environment.SERVER, {
      targetType: input.targetType,
      targetId: input.target,
      authorId: context.session.user.id,
      body: body.slice(0, 600),
    });
  },
  "Comment.post",
);

export const remove = withAuthentication(
  async (context, { comment: id }: { comment: string }) => {
    const existing = await get(Environment.SERVER, id);
    if (!existing.success) return existing;
    if (!existing.data)
      return { success: false as const, error: new Error("not-found") };
    if (existing.data.authorId !== context.session.user.id)
      return { success: false as const, error: new Error("forbidden") };
    return destroy(Environment.SERVER, id);
  },
  "Comment.remove",
);
