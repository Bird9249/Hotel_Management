import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Home, Loader2, MonitorSmartphone } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNotifications } from "@/app/providers/NotificationProvider";
import { Button, Separator } from "@/components/kit";
import { useAuthState } from "@/modules/auth/presentation/model/useAuthState";

export function MobileShell() {
  const { isLoading, isAuthenticated } = useAuthState();
  const navigate = useNavigate({ from: "/m" });
  const { devicePermission, deviceSupported, enableDeviceNotifications } =
    useNotifications();
  const notificationPrompted = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/auth/login" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (!deviceSupported || devicePermission !== "default") return;
    if (notificationPrompted.current) return;

    notificationPrompted.current = true;
    void enableDeviceNotifications();
  }, [
    devicePermission,
    deviceSupported,
    enableDeviceNotifications,
    isAuthenticated,
    isLoading,
  ]);

  if (isLoading) {
    return (
      <main className="grid min-h-svh place-items-center bg-background">
        <Loader2 className="animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-svh bg-muted/30">
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background shadow-sm">
        <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Housekeeping Mobile</p>
              <p className="text-muted-foreground text-xs">ໜ້າຈໍສຳລັບແມ່ບ້ານ</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/app/housekeeping">
                <MonitorSmartphone data-icon="inline-start" />
                Desktop
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex-1">
          <Outlet />
        </div>

        <footer className="sticky bottom-0 border-t bg-background/95 px-4 py-2 backdrop-blur">
          <nav className="flex items-center justify-around">
            <Button asChild className="h-11" variant="ghost">
              <Link to="/m/housekeeping">
                <Home data-icon="inline-start" />
                ວຽກແມ່ບ້ານ
              </Link>
            </Button>
          </nav>
          <Separator className="mt-2" />
          <p className="pt-2 text-center text-muted-foreground text-xs">
            ຂໍ້ມູນອັບເດດທຸກ 10 ວິນາທີ
          </p>
        </footer>
      </div>
    </div>
  );
}
