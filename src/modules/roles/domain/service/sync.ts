import { appendAudit } from "@/modules/audit/domain/services/append-audit";
import { nowISO } from "@/shared/lib/date-time";
import { makeService } from "@/shared/service";
import { syncFromCode as syncFromCodeDb } from "../repo/sync-from-code";

export const syncFromCodeService = makeService<{ ctx?: unknown }, { ok: true }>(
  {
    name: "rbacSyncFromCode",
    run: async (client) => {
      await syncFromCodeDb(client);
      return { ok: true } as const;
    },
    onSuccess: async ({ client }) => {
      await appendAudit(client, [
        {
          occurredAt: nowISO(),
          action: "RBAC.SYNC",
          result: "success",
        },
      ]);
    },
  },
);
