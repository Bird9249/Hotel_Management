import type { RoleDTO } from "@/modules/roles/presentation/api/client";
import { config } from "@/shared/lib/config";
import { fetchLookupForInfinite, hydrateLookupItem } from "@/shared/lib/utils";
import { resolveImageSrc } from "@/shared/ui/AppImage";
import { AvatarDeferredUpload } from "@/shared/ui/AvatarDeferredUpload";
import { FormInfiniteCombobox } from "@/shared/ui/FormInfiniteCombobox";
import {
  Button,
  FormInput,
  FormPassword,
  FormRoot,
  RHF,
  zodResolver,
} from "@devhop/ui";
import { z } from "zod";

const UserFormSchema = z.object({
  email: z.string().email({ message: "ກະລຸນາໃສ່ອີເມວໃຫ້ຖືກຕ້ອງ" }),
  name: z.string().min(1, "ຕ້ອງໃສ່ຊື່"),
  password: z.string().min(6, "ລະຫັດຜ່ານຕ້ອງຢ່າງນ້ອຍ 6 ຕົວອັກສອນ").optional(),
  roleId: z.string().min(1, "ຕ້ອງເລືອກບົດບາດ").optional(),
  image: z.string().optional().nullable(),
  imageFile: z.instanceof(File).optional().nullable(),
});

export type UserFormValues = z.infer<typeof UserFormSchema>;

export function UserForm({
  initialValues,
  onSubmit,
  submitting,
}: {
  initialValues?: Partial<UserFormValues>;
  onSubmit: (values: {
    email: string;
    name: string;
    password?: string;
    roleId?: string;
    image?: string | null;
    imageFile?: File | null;
  }) => void;
  submitting?: boolean;
}) {
  const schema = initialValues
    ? UserFormSchema.omit({ password: true }).extend(
        z.object({ password: z.string().optional() }).shape,
      )
    : UserFormSchema;

  const methods = RHF.useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      roleId: "",
      image: undefined,
      imageFile: undefined,
      ...initialValues,
    },
  });

  return (
    <FormRoot<UserFormValues>
      methods={methods}
      onSubmit={(vals) =>
        onSubmit({
          email: vals.email,
          name: vals.name,
          password: vals.password || undefined,
          roleId: vals.roleId || undefined,
          image: vals.image ?? undefined,
          imageFile: vals.imageFile ?? undefined,
        })
      }
      className="space-y-4"
    >
      <div data-tourid="form-avatar">
        <RHF.Controller
          name="image"
          control={methods.control}
          render={({ field: imageField }) => (
            <RHF.Controller
              name="imageFile"
              control={methods.control}
              render={({ field: fileField }) => (
                <AvatarDeferredUpload
                  value={
                    imageField.value
                      ? resolveImageSrc(imageField.value)
                      : undefined
                  }
                  imageFile={fileField.value ?? undefined}
                  onChange={imageField.onChange}
                  onFileSelect={fileField.onChange}
                  hint="ເລືອກຮູບ ຈະອັບໂຫຼດເມື່ອກົດບັນທຶກ"
                />
              )}
            />
          )}
        />
      </div>
      <div data-tourid="form-email">
        <FormInput
          name="email"
          label="ອີເມວ"
          type="email"
          requiredMark
          placeholder="name@example.com"
        />
      </div>
      <div data-tourid="form-name">
        <FormInput name="name" label="ຊື່" requiredMark placeholder="John Doe" />
      </div>
      <div data-tourid="form-password">
        <FormPassword
          name="password"
          label="ລະຫັດຜ່ານ"
          placeholder="********"
          requiredMark={!initialValues}
        />
      </div>
      <div data-tourid="form-role">
        <FormInfiniteCombobox<RoleDTO>
          name="roleId"
          label="ບົດບາດ"
          requiredMark
          queryKey={["roles"]}
          queryFn={(args) =>
            fetchLookupForInfinite(`${config.apiUrl}/rbac/roles/lookup`, args)
          }
          preloadQueryFn={(id) =>
            hydrateLookupItem(`${config.apiUrl}/rbac/roles/lookup`, id)
          }
          getLabel={(item) => item.name}
          getValue={(item) => item.id}
          placeholder="ເລືອກບົດບາດ..."
        />
      </div>

      <div className="flex justify-end gap-2" data-tourid="form-submit">
        <Button type="submit" isLoading={submitting}>
          ບັນທຶກ
        </Button>
      </div>
    </FormRoot>
  );
}
