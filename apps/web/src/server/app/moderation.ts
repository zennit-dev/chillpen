"use server";

import { eq, inArray } from "drizzle-orm";
import { unique } from "@/utils/array";
import { schema } from "../database";
import { withAuthorization } from "../utils/authorization";
import { Environment } from "../utils/environment";
import type { Document } from "../utils/repository";
import { repository } from "../utils/repository";
import * as Chapter from "./chapter";

export const { get, paginate, find, update } = repository(
  schema.moderationQueue,
);

export type Type = Document<typeof schema.moderationQueue>;
export type QueueItem = Type & { chapter: Chapter.Type | null };

export const queue = withAuthorization(
  ["admin"],
  async (_, { page = 1, size = 20 }: { page?: number; size?: number } = {}) => {
    const entries = await paginate(Environment.SERVER, page, size, {
      where: eq(schema.moderationQueue.status, "pending"),
      orderBy: [{ column: schema.moderationQueue.createdAt, direction: "asc" }],
    });
    if (!entries.success) return entries;

    const chapterIds = unique(
      entries.data.items.map((entry) => entry.chapterId),
    );
    const chapters =
      chapterIds.length > 0
        ? await Chapter.find(Environment.SERVER, {
            where: inArray(schema.chapter.id, chapterIds),
          })
        : { success: true as const, data: [] as Chapter.Type[] };

    const map = chapters.success
      ? new Map(chapters.data.map((chapter) => [chapter.id, chapter]))
      : new Map<string, Chapter.Type>();

    return {
      success: true as const,
      data: {
        items: entries.data.items.map(
          (entry): QueueItem => ({
            ...entry,
            chapter: map.get(entry.chapterId) ?? null,
          }),
        ),
        pagination: entries.data.pagination,
      },
    };
  },
  "Moderation.queue",
);

export const withDiff = withAuthorization(
  ["admin"],
  async (_, { chapter: id }: { chapter: string }) =>
    Chapter.augmented(Environment.SERVER, id),
  "Moderation.withDiff",
);
