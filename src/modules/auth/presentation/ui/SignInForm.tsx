import {
  Button,
  FormCheckbox,
  FormInput,
  FormPassword,
  FormRoot,
  Loader,
  RHF,
  Separator,
  toast,
  zodResolver,
} from "@/components/kit";
import { useNavigate } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { authClient } from "../api/client";
import { useDevLoginEnabled } from "../api/useDevLoginEnabled";
import { useAuthState } from "../model/useAuthState";
import { DEV_LOGIN_ROLES, type DevLoginRoleId } from "./dev-login-roles";

const SignInFormSchema = z.object({
  email: z.string().email({ message: "ອີເມວບໍ່ຖືກຕ້ອງ" }),
  password: z.string().min(6, { message: "ລະຫັດຜ່ານຕ້ອງຢ່າງນ້ອຍ 8 ຕົວອັກສອນ" }),
  rememberMe: z.boolean().optional(),
});

type ISignInFormSchema = z.infer<typeof SignInFormSchema>;

export default function SignInForm() {
  const navigate = useNavigate({ from: "/" });
  const { isLoading } = useAuthState();
  const devLogin = useDevLoginEnabled();

  const [devLoginRoleId, setDevLoginRoleId] = useState<DevLoginRoleId | null>(
    null,
  );

  const form = RHF.useForm({
    defaultValues: { email: "", password: "", rememberMe: false },
    resolver: zodResolver(SignInFormSchema),
  });

  const isSubmitting = form.formState.isSubmitting;
  const isSigningIn = isSubmitting || devLoginRoleId != null;

  const signInWithCredentials = async (email: string, password: string) => {
    form.setValue("email", email);
    form.setValue("password", password);

    await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => {
          navigate({ to: "/app/dashboard" });
          toast.success("ເຂົ້າລະບົບສໍາເລັດ");
        },
        onError: (error) => {
          toast.error(error.error.message || error.error.statusText);
        },
      },
    );
  };

  const handleSubmit = async (value: ISignInFormSchema) => {
    await signInWithCredentials(value.email, value.password);
  };

  const handleDevRoleLogin = async (roleId: DevLoginRoleId) => {
    const role = DEV_LOGIN_ROLES.find((item) => item.id === roleId);
    if (!role) return;

    setDevLoginRoleId(roleId);
    try {
      await signInWithCredentials(role.email, role.password);
    } finally {
      setDevLoginRoleId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <FormRoot<ISignInFormSchema>
        methods={form}
        onSubmit={handleSubmit}
        className="gap-5"
      >
        <div className="flex flex-col gap-4">
          <FormInput
            name="email"
            label="ອີເມວ"
            requiredMark
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
          />
          <FormPassword
            name="password"
            label="ລະຫັດຜ່ານ"
            requiredMark
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <FormCheckbox name="rememberMe" label="ຈໍາຂ້ອຍໄວ້" />
        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isSubmitting}
            disabled={devLoginRoleId != null}
          >
            {!isSubmitting ? <LogIn data-icon="inline-start" /> : null}
            ເຂົ້າລະບົບ
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs">
              ສຳລັບພະນັກງານໂຮງແຮມ
            </span>
            <Separator className="flex-1" />
          </div>
        </div>
      </FormRoot>

      {devLogin.data ? (
        <div className="rounded-lg border border-amber-500/40 border-dashed bg-amber-500/5 p-4">
          <p className="mb-3 font-medium text-amber-800 text-sm dark:text-amber-200">
            Dev — ເຂົ້າລະບົບດ່ວນ
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {DEV_LOGIN_ROLES.map((role) => (
              <Button
                key={role.id}
                type="button"
                variant="outline"
                size="sm"
                disabled={isSigningIn}
                isLoading={devLoginRoleId === role.id}
                onClick={() => handleDevRoleLogin(role.id)}
              >
                {role.label}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
