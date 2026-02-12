import { getAuditContext } from "@/modules/audit/domain/http/helpers";
import { appendAudit } from "@/modules/audit/domain/services/append-audit";
import { nowISO } from "@/shared/lib/date-time";
import { makeService } from "@/shared/service";
import { randomUUIDv7 } from "bun";
import type { RoleCreateInput } from "../contracts";
import { createRole as createRoleDb } from "../repo/create-role";

export const createRoleService = makeService<
  { input: RoleCreateInput },
  { created: Awaited<ReturnType<typeof createRoleDb>> }
>({
  name: "createRole",
  run: async (client, { input }) => {
    const created = await createRoleDb(
      { ...input, id: randomUUIDv7() },
      client,
    );
    if (!created) throw new Error("Failed to create role");
    return { created };
  },
  onSuccess: async ({ client, input, output, ctx }) => {
    if (!ctx || !output?.created) return;
    await appendAudit(client, [
      {
        occurredAt: nowISO(),
        action: "RBAC.ROLE.CREATE",
        entityType: "role",
        entityId: output.created.id,
        result: "success",
        after: { ...output.created, ...input.input },
        ...getAuditContext(ctx),
      },
    ]);
  },
});
