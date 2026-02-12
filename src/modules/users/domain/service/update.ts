import { getAuditContext } from "@/modules/audit/domain/http/helpers";
import { appendAudit } from "@/modules/audit/domain/services/append-audit";
import { deleteUserImage } from "@/server/utils/delete-user-image";
import { nowISO } from "@/shared/lib/date-time";
import { makeService } from "@/shared/service";
import type { UpdateUserDTO } from "../contracts";
import { getUserById } from "../repo/get-by-id";
import { updateUser as updateUserDb } from "../repo/update";

export const updateUserService = makeService<
  { id: string; input: UpdateUserDTO },
  {
    updated: Awaited<ReturnType<typeof updateUserDb>>;
    before: Awaited<ReturnType<typeof getUserById>>;
  }
>({
  name: "userUpdate",
  run: async (client, { id, input }) => {
    const existing = await getUserById(id, client);
    if (!existing) throw new Error("User not found");

    const nextImage =
      input.image !== undefined
        ? input.image === null || input.image === ""
          ? null
          : input.image.trim() || null
        : existing.image;

    const imageChanged =
      nextImage !== (existing.image ?? undefined) ||
      (input.image !== undefined &&
        (input.image === null || input.image === ""));
    const oldImageToDelete =
      imageChanged && existing.image ? existing.image : null;

    const next: UpdateUserDTO = { ...input, image: nextImage };
    const updated = await updateUserDb(id, next, client);
    if (!updated) throw new Error("Failed to update user");
    if (oldImageToDelete) {
      await deleteUserImage(oldImageToDelete);
    }
    return { updated, before: existing };
  },
  onSuccess: async ({ client, input, output, ctx }) => {
    if (!ctx || !output) return;
    if (!output || "error" in output) return;
    await appendAudit(client, [
      {
        occurredAt: nowISO(),
        action: "USER.UPDATE",
        entityType: "user",
        entityId: input.id,
        result: "success",
        before: output.before ?? undefined,
        after: output.updated ?? undefined,
        ...getAuditContext(ctx),
      },
    ]);
  },
});
