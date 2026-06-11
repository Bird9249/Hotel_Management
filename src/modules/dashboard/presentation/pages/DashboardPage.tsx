import { Link } from "@tanstack/react-router";
import { ChartColumn } from "lucide-react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { Button } from "@/components/kit";
import { usePermissions } from "@/modules/auth/presentation/model/usePermissions";
import { OccupancyChart } from "../ui/OccupancyChart";
import { QuickActions } from "../ui/QuickActions";
import { RecentBookings } from "../ui/RecentBookings";
import { RevenueChart } from "../ui/RevenueChart";
import { RoomStatus } from "../ui/RoomStatus";
import { StatCards } from "../ui/StatCards";

export function DashboardPage() {
  const { has } = usePermissions();
  const canReadReports = has("reports:read");

  return (
    <>
      <Header />

      <Main>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-bold text-2xl tracking-tight">ແຜງຄວບຄຸມ</h1>
            <p className="text-muted-foreground">ພາບລວມການດຳເນີນງານຂອງໂຮງແຮມ.</p>
          </div>
          {canReadReports && (
            <Button variant="outline" asChild>
              <Link to="/app/reports">
                <ChartColumn />
                ເບິ່ງລາຍງານ
              </Link>
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <QuickActions />
          <StatCards />

          {canReadReports && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <RevenueChart />
              <OccupancyChart />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <RecentBookings />
            <RoomStatus />
          </div>
        </div>
      </Main>
    </>
  );
}
