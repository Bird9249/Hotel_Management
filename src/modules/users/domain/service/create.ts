import { getAuditContext } from "@/modules/audit/domain/http/helpers";
import { appendAudit } from "@/modules/audit/domain/services/append-audit";
import { createCredentialAccount } from "@/modules/auth/domain/repo/create-account";
import { bcryptLikeHasher } from "@/modules/auth/domain/services/password.bcrypt";
import { USER_ROLES } from "@/modules/roles/domain/contracts/user-roles";
import { assignRoleToUser } from "@/modules/roles/domain/repo/assign-role-to-user";
import { nowISO } from "@/shared/lib/date-time";
import { makeService } from "@/shared/service";
import type { CreateUserDTO } from "../contracts";
import { createUser } from "../repo/create";

export const createUserService = makeService<
  { input: CreateUserDTO },
  { created: Awaited<ReturnType<typeof createUser>> }
>({
  name: "userCreate",
  run: async (client, { input }) => {
    const imageKey = input.image?.trim() || null;
    const now = nowISO();
    const created = await createUser(
      {
        email: input.email,
        name: input.name ?? undefined,
        image: imageKey,
        emailVerified: false,
        banned: false,
        createdAt: now,
        updatedAt: now,
        role: USER_ROLES.staff,
      },
      client,
    );

    if (!created) {
      throw new Error("Failed to create user");
    }

    if (input.password) {
      const passwordHash = await bcryptLikeHasher.hash(input.password);
      await createCredentialAccount(
        { userId: created.id, passwordHash, now },
        client,
      );
    }
    if (input.roleId) {
      await assignRoleToUser(created.id, input.roleId, client);
    }
    return { created };
  },
  onSuccess: async ({ client, input, output, ctx }) => {
    if (!ctx) return;
    if (!output || !output.created) return;
    await appendAudit(client, [
      {
        occurredAt: nowISO(),
        action: "USER.CREATE",
        entityType: "user",
        entityId: output.created.id,
        result: "success",
        after: { ...output, ...input.input },
        ...getAuditContext(ctx),
      },
    ]);
  },
});
