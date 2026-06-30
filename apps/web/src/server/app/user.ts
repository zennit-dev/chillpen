"use server";

import { eq } from "drizzle-orm";
import { schema } from "../database";
import type { AvatarConfig } from "../database/schema";
import { withAuthentication } from "../utils/authentication";
import { withContext } from "../utils/context";
import { Environment } from "../utils/environment";
import type { Document } from "../utils/repository";
import { repository } from "../utils/repository";

export const { get, paginate, create, update, destroy, exists, count, find } =
  repository(schema.user);

export type Type = Document<typeof schema.user>;

export const updateProfile = withAuthentication(
  async (
    context,
    data: {
      name?: string;
      surname?: string;
      email?: string;
      jobTitle?: string;
      company?: string;
      source?: string;
    },
  ) => {
    return update(Environment.SERVER, context.session.user.id, data);
  },
  "User.updateProfile",
);

export const completeProfile = withAuthentication(
  async (
    context,
    data: {
      company: string;
      jobTitle: string;
      source?: string;
    },
  ) => {
    return update(Environment.SERVER, context.session.user.id, data);
  },
  "User.completeProfile",
);

export const byPseudonym = withContext(async (_, pseudonym: string) => {
  const users = await find(Environment.SERVER, {
    where: eq(schema.user.pseudonym, pseudonym),
    limit: 1,
  });
  if (!users.success) return users;
  return { success: true as const, data: users.data[0] ?? null };
}, "User.byPseudonym");

export const setPseudonym = withAuthentication(
  async (context, pseudonym: string) => {
    const existing = await find(Environment.SERVER, {
      where: eq(schema.user.pseudonym, pseudonym),
      limit: 1,
    });
    if (!existing.success) return existing;
    if (existing.data[0] && existing.data[0].id !== context.session.user.id)
      return { success: false as const, error: new Error("pseudonym-taken") };
    return update(Environment.SERVER, context.session.user.id, { pseudonym });
  },
  "User.setPseudonym",
);

export const updateAvatar = withAuthentication(
  async (
    context,
    data: { avatarConfig?: AvatarConfig; bio?: string; banner?: string },
  ) => update(Environment.SERVER, context.session.user.id, data),
  "User.updateAvatar",
);

// Set the starter avatar preset while preserving any equipped cosmetics.
export const setAvatarPreset = withAuthentication(
  async (context, preset: string) => {
    const account = await get(Environment.SERVER, context.session.user.id);
    if (!account.success) return account;
    const avatarConfig: AvatarConfig = {
      ...(account.data?.avatarConfig ?? {}),
      preset,
    };
    return update(Environment.SERVER, context.session.user.id, {
      avatarConfig,
    });
  },
  "User.setAvatarPreset",
);
