import { loadEnvConfig } from "@next/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations, tables } from "./schema";

// Standalone scripts (e.g. `bun run seed`) run via tsx — outside Next — so
// `.env*` files are NOT auto-loaded and `DATABASE_URL` would be empty, making
// postgres.js fall back to libpq defaults (it connects to a DB named after the
// OS user). Inside Next the variable is already set, so this is a no-op.
if (!process.env.DATABASE_URL) loadEnvConfig(process.cwd(), false);

const schema = { ...tables, ...relations };

/**
 * Postgres client for server-side only (no connection in edge runtime by default).
 * For serverless, use a connection pooler (e.g. PgBouncer) or pool with max 1.
 */
const client = postgres(process.env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

/**
 * Drizzle instance with schema for typed queries and relations.
 * Use this with better-auth's drizzleAdapter and with the repository helper.
 */
export const db = drizzle({ client, schema });

export type TransactionScope = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];

export const withTransaction = <T>(
  callback: (tx: TransactionScope) => Promise<T>,
): Promise<T> => db.transaction(callback);

export type {
  abuseReport,
  account,
  challenge,
  chapter,
  chapterLike,
  coinLedger,
  cosmetic,
  follow,
  genre,
  leaderboardSnapshot,
  moderationQueue,
  readPath,
  save,
  session,
  universe,
  user,
  userCosmetic,
  verification,
} from "./schema";
export { tables as schema };
