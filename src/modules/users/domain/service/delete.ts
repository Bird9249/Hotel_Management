import { getAuditContext } from "@/modules/audit/domain/http/helpers";
import { appendAudit } from "@/modules/audit/domain/services/append-audit";
import { deleteUserImage } from "@/server/utils/delete-user-image";
import { nowISO } from "@/shared/lib/date-time";
import { makeService } from "@/shared/service";
import { removeUser } from "../repo/remove";

export const deleteUserService = makeService<
  { id: string },
  { deleted: Awaited<ReturnType<typeof removeUser>> }
>({
  name: "userDelete",
  run: async (client, { id }) => {
    const user = await removeUser(id, client);

    if (user?.image) {
      await deleteUserImage(user.image);
    }

    return { deleted: user };
  },
  onSuccess: async ({ client, input, output, ctx }) => {
    if (!ctx || !output) return;
    await appendAudit(client, [
      {
        occurredAt: nowISO(),
        action: "USER.DELETE",
        entityType: "user",
        entityId: input.id,
        result: "success",
        before: output.deleted ?? undefined,
        ...getAuditContext(ctx),
      },
    ]);
  },
});
