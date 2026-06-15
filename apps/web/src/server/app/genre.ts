"use server";

import { eq } from "drizzle-orm";
import { schema } from "../database";
import { withContext } from "../utils/context";
import { Environment } from "../utils/environment";
import type { Document } from "../utils/repository";
import { repository } from "../utils/repository";

export const { get, paginate, create, update, destroy, exists, count, find } =
  repository(schema.genre);

export type Type = Document<typeof schema.genre>;

export const list = withContext(
  async () =>
    find(Environment.SERVER, {
      orderBy: [{ column: schema.genre.name, direction: "asc" }],
    }),
  "Genre.list",
);

export const bySlug = withContext(async (_, slug: string) => {
  const genres = await find(Environment.SERVER, {
    where: eq(schema.genre.slug, slug),
    limit: 1,
  });
  if (!genres.success) return genres;
  return { success: true as const, data: genres.data[0] ?? null };
}, "Genre.bySlug");
