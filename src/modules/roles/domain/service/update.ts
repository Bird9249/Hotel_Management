import { getAuditContext } from "@/modules/audit/domain/http/helpers";
import { appendAudit } from "@/modules/audit/domain/services/append-audit";
import { nowISO } from "@/shared/lib/date-time";
import { makeService } from "@/shared/service";
import type { RoleUpdateInput } from "../contracts";
import { getRoleById } from "../repo/get-role-by-id";
import { updateRole as updateRoleDb } from "../repo/update-role";

export const updateRoleService = makeService<
  { id: string; input: RoleUpdateInput },
  {
    updated: Awaited<ReturnType<typeof updateRoleDb>>;
    before: Awaited<ReturnType<typeof getRoleById>>;
  }
>({
  name: "updateRole",
  run: async (client, { id, input }) => {
    const before = await getRoleById(id, client);
    if (!before) throw new Error("Role not found");
    const updated = await updateRoleDb(id, input, client);
    if (!updated) throw new Error("Failed to update role");
    return { updated, before };
  },
  onSuccess: async ({ client, input, output, ctx }) => {
    if (!ctx || !output) return;
    await appendAudit(client, [
      {
        occurredAt: nowISO(),
        action: "RBAC.ROLE.UPDATE",
        entityType: "role",
        entityId: input.id,
        result: "success",
        before: output.before ?? undefined,
        after: output.updated ?? undefined,
        ...getAuditContext(ctx),
      },
    ]);
  },
});
