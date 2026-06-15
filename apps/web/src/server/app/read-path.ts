"use server";

import { and, eq, inArray } from "drizzle-orm";
import { unique } from "@/utils/array";
import { schema } from "../database";
import { withAuthentication } from "../utils/authentication";
import { withContext } from "../utils/context";
import { Environment } from "../utils/environment";
import type { Document } from "../utils/repository";
import { repository } from "../utils/repository";
import * as Chapter from "./chapter";
import * as Universe from "./universe";

export const { get, paginate, create, update, destroy, find } = repository(
  schema.readPath,
);

export type Type = Document<typeof schema.readPath>;

export type ResumeEntry = Type & { universe: Universe.Type | null };

export const forUniverse = withAuthentication(
  async (context, { universe }: { universe: string }) => {
    const paths = await find(Environment.SERVER, {
      where: and(
        eq(schema.readPath.userId, context.session.user.id),
        eq(schema.readPath.universeId, universe),
      ),
      limit: 1,
    });
    if (!paths.success) return paths;
    return { success: true as const, data: paths.data[0] ?? null };
  },
  "ReadPath.forUniverse",
);

export const choose = withAuthentication(
  async (
    context,
    { universe, chapter }: { universe: string; chapter: string },
  ) => {
    const existing = await find(Environment.SERVER, {
      where: and(
        eq(schema.readPath.userId, context.session.user.id),
        eq(schema.readPath.universeId, universe),
      ),
      limit: 1,
    });
    if (!existing.success) return existing;

    const current = existing.data[0];
    const chapters = current
      ? unique([...current.chapters, chapter])
      : [chapter];

    const saved = await (current
      ? update(Environment.SERVER, current.id, { chapters, cursor: chapter })
      : create(Environment.SERVER, {
          userId: context.session.user.id,
          universeId: universe,
          chapters,
          cursor: chapter,
        }));

    void Chapter.incrementReads(Environment.SERVER, { chapter });
    return saved;
  },
  "ReadPath.choose",
);

export const resume = withAuthentication(async (context) => {
  const paths = await find(Environment.SERVER, {
    where: eq(schema.readPath.userId, context.session.user.id),
    orderBy: [{ column: schema.readPath.updatedAt, direction: "desc" }],
    limit: 12,
  });
  if (!paths.success) return paths;

  const universeIds = unique(paths.data.map((path) => path.universeId));
  const universes =
    universeIds.length > 0
      ? await Universe.find(Environment.SERVER, {
          where: inArray(schema.universe.id, universeIds),
        })
      : { success: true as const, data: [] as Universe.Type[] };

  const universeMap = universes.success
    ? new Map(universes.data.map((universe) => [universe.id, universe]))
    : new Map<string, Universe.Type>();

  return {
    success: true as const,
    data: paths.data.map(
      (path): ResumeEntry => ({
        ...path,
        universe: universeMap.get(path.universeId) ?? null,
      }),
    ),
  };
}, "ReadPath.resume");

export const compare = withContext(
  async (_, { branches }: { branches: [string, string] }) => {
    const [first, second] = await Promise.all([
      Chapter.augmented(Environment.SERVER, branches[0]),
      Chapter.augmented(Environment.SERVER, branches[1]),
    ]);
    if (!first.success) return first;
    if (!second.success) return second;
    return {
      success: true as const,
      data: { first: first.data, second: second.data },
    };
  },
  "ReadPath.compare",
);
