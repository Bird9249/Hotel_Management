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
import z from "zod";
import { authClient } from "../api/client";
import { useAuthState } from "../model/useAuthState";

const SignInFormSchema = z.object({
  email: z.string().email({ message: "ອີເມວບໍ່ຖືກຕ້ອງ" }),
  password: z.string().min(6, { message: "ລະຫັດຜ່ານຕ້ອງຢ່າງນ້ອຍ 8 ຕົວອັກສອນ" }),
  rememberMe: z.boolean().optional(),
});

type ISignInFormSchema = z.infer<typeof SignInFormSchema>;

export default function SignInForm() {
  const navigate = useNavigate({ from: "/" });
  const { isLoading } = useAuthState();

  const form = RHF.useForm({
    defaultValues: { email: "", password: "", rememberMe: false },
    resolver: zodResolver(SignInFormSchema),
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (value: ISignInFormSchema) => {
    await authClient.signIn.email(
      { email: value.email, password: value.password },
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

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
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
  );
}
