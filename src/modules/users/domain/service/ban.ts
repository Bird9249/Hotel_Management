import { getAuditContext } from "@/modules/audit/domain/http/helpers";
import { appendAudit } from "@/modules/audit/domain/services/append-audit";
import { nowISO } from "@/shared/lib/date-time";
import { makeService } from "@/shared/service";
import { banUser as banUserDb } from "../repo/user-ban";

export const banUserService = makeService<
  {
    id: string;
    reason?: string;
    /** ISO 8601 datetime string – รับจาก API เป็น string ตลอดสาย */
    expires?: string | null;
  },
  { ok: true }
>({
  name: "userBan",
  run: async (client, { id, reason, expires }) => {
    await banUserDb(id, reason ?? "", expires ?? null, client);
    return { ok: true } as const;
  },
  onSuccess: async ({ client, input, ctx }) => {
    if (!ctx) return;
    await appendAudit(client, [
      {
        occurredAt: nowISO(),
        action: "USER.BAN",
        entityType: "user",
        entityId: input.id,
        result: "success",
        ...getAuditContext(ctx),
      },
    ]);
  },
});
