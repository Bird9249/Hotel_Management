import { getAuditContext } from "@/modules/audit/domain/http/helpers";
import { appendAudit } from "@/modules/audit/domain/services/append-audit";
import { nowISO } from "@/shared/lib/date-time";
import { makeService } from "@/shared/service";
import { deleteRole as deleteRoleDb } from "../repo/delete-role";
import { getRoleById } from "../repo/get-role-by-id";

export const deleteRoleService = makeService<{ id: string }, { ok: true }>({
  name: "deleteRole",
  run: async (client, { id }) => {
    await deleteRoleDb(id, client);
    return { ok: true } as const;
  },
  onSuccess: async ({ client, input, ctx }) => {
    if (!ctx) return;
    const before = await getRoleById(input.id, client);
    await appendAudit(client, [
      {
        occurredAt: nowISO(),
        action: "RBAC.ROLE.DELETE",
        entityType: "role",
        entityId: input.id,
        result: "success",
        before: before ?? undefined,
        ...getAuditContext(ctx),
      },
    ]);
  },
});
