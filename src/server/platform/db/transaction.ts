import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { BunSQLQueryResultHKT } from "drizzle-orm/bun-sql";
import type { DbClient } from "./client";
import type * as schema from "./schema";

/** Drizzle transaction client (not the root pool client). */
export type DbTx = PgTransaction<
  BunSQLQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

/**
 * Run mutation logic inside a single DB transaction.
 * Use from HTTP route handlers for POST/PUT/PATCH/DELETE only — not GET.
 *
 * Services that accept `DbTransaction` should receive `tx` from here so
 * multi-step writes (payment + invoice status, check-in + room, etc.) commit
 * or roll back together.
 */
export async function runInTransaction<T>(
  db: DbClient,
  fn: (tx: DbTx) => Promise<T>,
): Promise<T> {
  return db.transaction((tx) => fn(tx));
}
