import { inArray } from "drizzle-orm";
import { db, schema } from "./index";

/** Placeholder universes from the original demo seed — replaced by the zip catalog. */
export const LEGACY_UNIVERSE_SLUGS = [
  "dusthollow",
  "the-ninth-tide",
  "signal-bloom",
  "letters-to-the-lantern",
  "the-quiet-machine",
  "thornwake",
] as const;

const legacyUniverseIds = LEGACY_UNIVERSE_SLUGS.map((slug) => `unv_${slug}`);

/** Remove legacy placeholder books and any orphaned saves that pointed at them. */
export const purgeLegacyUniverses = async () => {
  await db
    .delete(schema.save)
    .where(inArray(schema.save.targetId, legacyUniverseIds));

  const removed = await db
    .delete(schema.universe)
    .where(inArray(schema.universe.slug, [...LEGACY_UNIVERSE_SLUGS]))
    .returning({ id: schema.universe.id });

  return removed.length;
};
