import { getAuditContext } from "@/modules/audit/domain/http/helpers";
import { appendAudit } from "@/modules/audit/domain/services/append-audit";
import { nowISO } from "@/shared/lib/date-time";
import { makeService } from "@/shared/service";
import { deleteRole as deleteRoleDb } from "../repo/delete-role";
import { getRoleById } from "../repo/get-role-by-id";

export const deleteRoleService = makeService<
  { id: string },
  { deleted: Awaited<ReturnType<typeof getRoleById>> }
>({
  name: "deleteRole",
  run: async (client, { id }) => {
    const before = await getRoleById(id, client);
    if (!before) throw new Error("Role not found");
    await deleteRoleDb(id, client);
    return { deleted: before };
  },
  onSuccess: async ({ client, input, output, ctx }) => {
    if (!ctx || !output) return;
    await appendAudit(client, [
      {
        occurredAt: nowISO(),
        action: "RBAC.ROLE.DELETE",
        entityType: "role",
        entityId: input.id,
        result: "success",
        before: output.deleted ?? undefined,
        ...getAuditContext(ctx),
      },
    ]);
  },
});
