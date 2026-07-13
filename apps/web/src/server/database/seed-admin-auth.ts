import { hashPassword } from "better-auth/crypto";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "./index";

/** Dev admin credentials — matches the chillpen prototype control room. */
export const ADMIN_EMAIL = "curator@chillpen.club";
export const ADMIN_PASSWORD = "curator2032";
const ADMIN_USER_ID = "usr_curator";
const ADMIN_ACCOUNT_ID = "acc_curator";

/** Ensures the seeded curator admin can sign in via Better Auth email/password. */
export const seedAdminAuth = async () => {
  const password = await hashPassword(ADMIN_PASSWORD);

  await db
    .update(schema.user)
    .set({ emailVerified: true, role: "admin" })
    .where(eq(schema.user.id, ADMIN_USER_ID));

  const existing = await db
    .select({ id: schema.account.id })
    .from(schema.account)
    .where(
      and(
        eq(schema.account.userId, ADMIN_USER_ID),
        eq(schema.account.providerId, "credential"),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(schema.account)
      .set({ password, updatedAt: sql`now()` })
      .where(eq(schema.account.id, existing[0].id));
    return;
  }

  await db.insert(schema.account).values({
    id: ADMIN_ACCOUNT_ID,
    userId: ADMIN_USER_ID,
    accountId: ADMIN_USER_ID,
    providerId: "credential",
    password,
  });
};
