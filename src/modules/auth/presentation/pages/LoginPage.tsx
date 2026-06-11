import SignInForm from "../ui/SignInForm";

export function LoginPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-2xl tracking-tight">ເຂົ້າລະບົບ</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          ໃສ່ອີເມວ ແລະ ລະຫັດຜ່ານເພື່ອເຂົ້າໃຊ້ລະບົບຈັດການໂຮງແຮມ
        </p>
      </div>

      <SignInForm />
    </div>
  );
}
