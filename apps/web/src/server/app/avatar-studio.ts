"use server";

import { revalidatePath } from "next/cache";
import {
  AVATAR_BASES,
  AVATAR_ITEMS,
  avatarRank,
  itemUnlocked,
  slotFor,
  type AvatarItem,
} from "@/lib/avatar-catalog";
import type { AvatarConfig } from "../database/schema";
import { withAuthentication } from "../utils/authentication";
import { Environment } from "../utils/environment";
import * as Coin from "./coin";
import * as User from "./user";

const starterAvatars = () => ["bird"] as const;

const normalizeConfig = (config: AvatarConfig | undefined): AvatarConfig => {
  const ownedAvatars = config?.ownedAvatars?.length
    ? [...new Set([...starterAvatars(), ...config.ownedAvatars])]
    : [...starterAvatars()];
  const preset =
    config?.preset && ownedAvatars.includes(config.preset)
      ? config.preset
      : "bird";

  return {
    ...config,
    preset,
    ownedAvatars,
    ownedItems: config?.ownedItems ?? [],
    equipped: config?.equipped ?? {},
  };
};

const saveConfig = async (user: string, config: AvatarConfig) => {
  const result = await User.update(Environment.SERVER, user, {
    avatarConfig: config,
  });
  if (result.success) {
    revalidatePath("/me/avatar");
    revalidatePath("/me");
    revalidatePath("/me/settings");
  }
  return result;
};

export type AvatarWallet = {
  coins: number;
  preset: string;
  ownedAvatars: string[];
  ownedItems: string[];
  equipped: Record<string, string>;
};

export const wallet = withAuthentication(async (context) => {
  const account = await User.get(Environment.SERVER, context.session.user.id);
  if (!account.success || !account.data)
    return { success: false as const, error: new Error("user-not-found") };

  const config = normalizeConfig(account.data.avatarConfig);
  const needsPersist =
    config.preset !== account.data.avatarConfig?.preset ||
    (config.ownedAvatars?.length ?? 0) !==
      (account.data.avatarConfig?.ownedAvatars?.length ?? 0);

  if (needsPersist) await saveConfig(context.session.user.id, config);

  return {
    success: true as const,
    data: {
      coins: account.data.coins,
      preset: config.preset ?? "bird",
      ownedAvatars: config.ownedAvatars ?? ["bird"],
      ownedItems: config.ownedItems ?? [],
      equipped: config.equipped ?? {},
    } satisfies AvatarWallet,
  };
}, "AvatarStudio.wallet");

export const unlockAvatar = withAuthentication(
  async (context, { avatar }: { avatar: string }) => {
    const base = AVATAR_BASES.find((entry) => entry.id === avatar);
    if (!base)
      return { success: false as const, error: new Error("avatar-not-found") };

    const account = await User.get(Environment.SERVER, context.session.user.id);
    if (!account.success || !account.data) return account;

    const config = normalizeConfig(account.data.avatarConfig);
    const owned = new Set(config.ownedAvatars ?? ["bird"]);

    if (owned.has(avatar)) {
      const updated = { ...config, preset: avatar };
      const saved = await saveConfig(context.session.user.id, updated);
      if (!saved.success) return saved;
      return {
        success: true as const,
        data: { ...config, preset: avatar, coins: account.data.coins },
      };
    }

    if (account.data.coins < base.price)
      return { success: false as const, error: new Error("insufficient-coins") };

    const spent = await Coin.award(Environment.SERVER, {
      user: context.session.user.id,
      delta: -base.price,
      reason: "avatar_unlock",
      referenceType: "avatar",
      referenceId: avatar,
    });
    if (!spent.success) return spent;

    owned.add(avatar);
    const updated: AvatarConfig = {
      ...config,
      preset: avatar,
      ownedAvatars: [...owned],
    };
    const saved = await saveConfig(context.session.user.id, updated);
    if (!saved.success) return saved;

    const refreshed = await User.get(Environment.SERVER, context.session.user.id);
    if (!refreshed.success || !refreshed.data) return refreshed;

    return {
      success: true as const,
      data: {
        preset: avatar,
        ownedAvatars: updated.ownedAvatars ?? [],
        coins: refreshed.data.coins,
      },
    };
  },
  "AvatarStudio.unlockAvatar",
);

export const purchaseItem = withAuthentication(
  async (context, { item }: { item: string }) => {
    const catalog = AVATAR_ITEMS.find((entry) => entry.id === item);
    if (!catalog)
      return { success: false as const, error: new Error("item-not-found") };

    const account = await User.get(Environment.SERVER, context.session.user.id);
    if (!account.success || !account.data) return account;

    const config = normalizeConfig(account.data.avatarConfig);
    const ownedItems = new Set(config.ownedItems ?? []);

    if (ownedItems.has(item))
      return { success: false as const, error: new Error("already-owned") };

    if (!itemUnlocked(catalog, config.ownedAvatars ?? ["bird"]))
      return { success: false as const, error: new Error("avatar-tier-locked") };

    if (account.data.coins < catalog.price)
      return { success: false as const, error: new Error("insufficient-coins") };

    const spent = await Coin.award(Environment.SERVER, {
      user: context.session.user.id,
      delta: -catalog.price,
      reason: "avatar_item_purchase",
      referenceType: "avatar_item",
      referenceId: item,
    });
    if (!spent.success) return spent;

    ownedItems.add(item);
    const saved = await saveConfig(context.session.user.id, {
      ...config,
      ownedItems: [...ownedItems],
    });
    if (!saved.success) return saved;

    const refreshed = await User.get(Environment.SERVER, context.session.user.id);
    if (!refreshed.success || !refreshed.data) return refreshed;

    return {
      success: true as const,
      data: { coins: refreshed.data.coins, ownedItems: [...ownedItems] },
    };
  },
  "AvatarStudio.purchaseItem",
);

export const wearItem = withAuthentication(
  async (context, { item }: { item: string }) => {
    const catalog = AVATAR_ITEMS.find((entry) => entry.id === item);
    if (!catalog)
      return { success: false as const, error: new Error("item-not-found") };

    const account = await User.get(Environment.SERVER, context.session.user.id);
    if (!account.success || !account.data) return account;

    const config = normalizeConfig(account.data.avatarConfig);
    if (!(config.ownedItems ?? []).includes(item))
      return { success: false as const, error: new Error("not-owned") };

    const slot = slotFor(catalog);
    const equipped = { ...(config.equipped ?? {}), [slot]: item };
    const saved = await saveConfig(context.session.user.id, { ...config, equipped });
    if (!saved.success) return saved;

    return { success: true as const, data: { equipped } };
  },
  "AvatarStudio.wearItem",
);

export const removeSlot = withAuthentication(
  async (context, { slot }: { slot: string }) => {
    const account = await User.get(Environment.SERVER, context.session.user.id);
    if (!account.success || !account.data) return account;

    const config = normalizeConfig(account.data.avatarConfig);
    const equipped = { ...(config.equipped ?? {}) };
    delete equipped[slot];

    const saved = await saveConfig(context.session.user.id, {
      ...config,
      equipped,
    });
    if (!saved.success) return saved;

    return { success: true as const, data: { equipped } };
  },
  "AvatarStudio.removeSlot",
);

export const equippedCatalog = (
  equipped: Record<string, string>,
): { slot: string; item: AvatarItem }[] =>
  Object.entries(equipped)
    .map(([slot, id]) => {
      const item = AVATAR_ITEMS.find((entry) => entry.id === id);
      return item ? { slot, item } : null;
    })
    .filter((entry): entry is { slot: string; item: AvatarItem } => !!entry);

export const requiredAvatarName = (requires: string | null) => {
  if (!requires) return null;
  return AVATAR_BASES[avatarRank(requires)]?.name ?? requires;
};
