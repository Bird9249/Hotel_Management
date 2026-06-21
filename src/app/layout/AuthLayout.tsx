import { Outlet, useNavigate } from "@tanstack/react-router";
import { Hotel } from "lucide-react";
import { useEffect } from "react";
import { Loader } from "@/components/kit";
import { ModeToggle } from "@/components/mode-toggle";
import { getPostLoginRoute } from "@/modules/auth/presentation/lib/post-login-route";
import { useAuthState } from "@/modules/auth/presentation/model/useAuthState";
import { loginHighlights } from "./data/login-highlights";
import { sidebarData } from "./data/sidebar-data";

export function AuthLayout() {
  const { isLoading, isAuthenticated, permissions } = useAuthState();
  const navigate = useNavigate({ from: "/auth" });
  const { brand } = sidebarData;
  const BrandLogo = brand.logo;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: getPostLoginRoute(permissions) });
    }
  }, [isLoading, isAuthenticated, navigate, permissions]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(1_0_0/0.12),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-e-24 -top-24 size-72 rounded-full bg-primary-foreground/5 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-s-16 -bottom-16 size-56 rounded-full bg-primary-foreground/5 blur-2xl"
        />

        <div className="relative flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
            <BrandLogo className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-lg leading-tight">
              {brand.name}
            </span>
            <span className="text-primary-foreground/70 text-sm">
              {brand.tagline}
            </span>
          </div>
        </div>

        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="font-semibold text-3xl leading-tight tracking-tight">
              ຈັດການໂຮງແຮມ
              <br />
              ໃຫ້ເປັນລະບົບດຽວ
            </h2>
            <p className="max-w-md text-primary-foreground/75 text-sm leading-relaxed">
              ເຂົ້າສູ່ລະບົບເພື່ອຈັດການຈອງ ຫ້ອງພັກ ແຂກ ໃບບິນ ແລະ ລາຍງານໃນແຜງຄວບຄຸມດຽວ
            </p>
          </div>

          <ul className="flex flex-col gap-4">
            {loginHighlights.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 ring-1 ring-primary-foreground/15">
                  <item.icon className="size-4" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">{item.title}</span>
                  <span className="text-primary-foreground/65 text-xs leading-relaxed">
                    {item.description}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-primary-foreground/50 text-xs">
          © {new Date().getFullYear()} Hotel Management
        </p>
      </aside>

      <div className="flex min-h-svh flex-col bg-background">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Hotel className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-tight">
                {brand.name}
              </span>
              <span className="text-muted-foreground text-xs">
                {brand.tagline}
              </span>
            </div>
          </div>
          <div className="ms-auto">
            <ModeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-10 sm:px-10">
          <div className="w-full max-w-[400px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
