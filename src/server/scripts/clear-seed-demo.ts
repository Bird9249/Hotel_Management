#!/usr/bin/env bun

import { db } from "@/server/platform/db/client";
import { logger } from "@/server/platform/observability/logger";
import { clearDemoSeedData, DEMO_PREFIX } from "./demo-seed-shared";

async function clearSeedDemo() {
  try {
    logger.info(`Clearing demo seed data (prefix: ${DEMO_PREFIX})...`);

    await db.transaction(async (tx) => {
      await clearDemoSeedData(tx);
    });

    logger.info("Demo seed data cleared!");
    logger.info("  Removed: invoices, reservations, guests, rooms, room types");
    logger.info(
      "  Run `bun run seed:hotel` then `bun run seed:billing` to re-seed.",
    );
  } catch (error) {
    logger.error("Clear demo seed failed:", error);
    process.exit(1);
  }
}

clearSeedDemo();
