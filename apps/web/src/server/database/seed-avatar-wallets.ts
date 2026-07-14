import { eq } from "drizzle-orm";
import { db, schema } from "./index";

const LEGACY_PRESETS: Record<string, string> = {
  quill: "bird",
  tome: "owl",
  moon: "owl",
  ember: "fox",
  mask: "alien",
};

/** Ensures every account has zip-style avatar wallet state (bird starter + PNG preset). */
export const seedAvatarWallets = async () => {
  const users = await db.select().from(schema.user);

  for (const account of users) {
    const raw = account.avatarConfig?.preset;
    const preset = (raw && LEGACY_PRESETS[raw]) || raw || "bird";
    const ownedAvatars = [
      ...new Set([
        "bird",
        ...(account.avatarConfig?.ownedAvatars ?? []),
        preset,
      ]),
    ];

    await db
      .update(schema.user)
      .set({
        avatarConfig: {
          ...account.avatarConfig,
          preset,
          ownedAvatars,
          ownedItems: account.avatarConfig?.ownedItems ?? [],
          equipped: account.avatarConfig?.equipped ?? {},
        },
      })
      .where(eq(schema.user.id, account.id));
  }

  return users.length;
};
