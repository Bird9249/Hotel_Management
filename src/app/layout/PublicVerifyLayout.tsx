import { Outlet } from "@tanstack/react-router";

/** Layout สำหรับหน้า public verify — ไม่ต้อง login */
export function PublicVerifyLayout() {
  return (
    <div className="min-h-svh bg-linear-to-b from-muted/40 to-background px-4 py-8 sm:px-6 sm:py-12">
      <Outlet />
    </div>
  );
}
