import { useParams, useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  CalendarDays,
  DoorOpen,
  Receipt,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Loader,
} from "@/components/kit";
import { formatDateLocal, formatDateTimeLocal } from "@/shared/lib/date-time";
import { AppImage } from "@/shared/ui/AppImage";
import { useInvoiceVerifyQuery } from "../api/public-queries";
import {
  displayInvoiceNumber,
  formatMoney,
  getInvoiceStatusMeta,
  getPaymentMethodLabel,
} from "../ui/invoice-status";

function VerifyField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-medium text-sm">{value}</p>
      </div>
    </div>
  );
}

function VerifyError({ title, description }: { title: string; description: string }) {
  return (
    <Card className="mx-auto w-full max-w-lg border-destructive/30">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function InvoiceVerifyPage() {
  const { id } = useParams({ from: "/verify/invoice/$id" });
  const { t: token } = useSearch({ from: "/verify/invoice/$id" });
  const result = useInvoiceVerifyQuery(id, token ?? "");

  if (!token) {
    return (
      <VerifyError
        title="ລິງກ໌ບໍ່ຄົບຖ້ວນ"
        description="ກະລຸນາສະແກນ QR code ຈາກໃບບິນທີ່ອອກໂດຍລະບົບ."
      />
    );
  }

  if (result.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (result.isError) {
    const message =
      result.error instanceof Error ? result.error.message : "REQUEST_FAILED";
    if (message === "INVALID_TOKEN") {
      return (
        <VerifyError
          title="ບໍ່ສາມາດຢືນຢັນໃບບິນ"
          description="ລິງກ໌ກວດສອບບໍ່ຖືກຕ້ອງ ຫຼື ຖືກປ່ຽນແປງ."
        />
      );
    }
    return (
      <VerifyError
        title="ບໍ່ພົບໃບບິນ"
        description="ບໍ່ພົບໃບບິນນີ້ໃນລະບົບ ຫຼື ລິງກ໌ໝົດອາຍຸ."
      />
    );
  }

  const data = result.data;
  if (!data) return null;

  const statusMeta = getInvoiceStatusMeta(data.status);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <ShieldCheck className="size-7" />
        </div>
        <div className="space-y-1">
          <h1 className="font-bold text-2xl tracking-tight">ຢືນຢັນໃບບິນ</h1>
          <p className="text-muted-foreground text-sm">
            ໃບບິນນີ້ອອກໂດຍລະບົບຈັດການໂຮງແຮມ ແລະ ຜ່ານການກວດສອບແລ້ວ
          </p>
        </div>
        <Badge className="gap-1.5 bg-emerald-600 hover:bg-emerald-600">
          <BadgeCheck className="size-3.5" />
          ໃບບິນຖືກຕ້ອງ
        </Badge>
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/20 text-center">
          {data.hotel.logoKey ? (
            <div className="mx-auto mb-3 h-12 w-36">
              <AppImage
                src={data.hotel.logoKey}
                alt={data.hotel.name}
                fit="contain"
                className="size-full"
                showLoading={false}
              />
            </div>
          ) : (
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl border bg-background">
              <Building2 className="size-6 text-muted-foreground" />
            </div>
          )}
          <CardTitle>{data.hotel.name}</CardTitle>
          {data.hotel.nameEn ? (
            <CardDescription>{data.hotel.nameEn}</CardDescription>
          ) : null}
          {data.hotel.address ? (
            <CardDescription className="mt-1">{data.hotel.address}</CardDescription>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/20 px-4 py-3">
            <div>
              <p className="text-muted-foreground text-xs">ເລກທີໃບບິນ</p>
              <p className="font-mono font-semibold">
                {displayInvoiceNumber(data.invoiceNumber)}
              </p>
            </div>
            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <VerifyField
              icon={UserRound}
              label="ລູກຄ້າ"
              value={data.guestName}
            />
            <VerifyField
              icon={DoorOpen}
              label="ຫ້ອງ"
              value={
                data.roomTypeName
                  ? `${data.roomNumber} (${data.roomTypeName})`
                  : data.roomNumber
              }
            />
            <VerifyField
              icon={CalendarDays}
              label="ເຂົ້າ–ອອກ"
              value={`${formatDateLocal(data.checkInDate)} – ${formatDateLocal(data.checkOutDate)}`}
            />
            <VerifyField
              icon={Receipt}
              label="ວັນທີອອກໃບບິນ"
              value={formatDateTimeLocal(data.issuedAt)}
            />
          </div>

          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">ລາຍການ</th>
                  <th className="px-3 py-2 text-right font-medium">ຈຳນວນ</th>
                  <th className="px-3 py-2 text-right font-medium">ລວມ</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={`${item.description}-${item.qty}-${item.amount}`} className="border-b border-dashed last:border-0">
                    <td className="px-3 py-2">{item.description}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{item.qty}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatMoney(item.amount)} ₭
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">ຍອດກ່ອນພາສີ</span>
              <span className="tabular-nums">{formatMoney(data.subtotal)} ₭</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">ພາສີ ({data.taxRate}%)</span>
              <span className="tabular-nums">{formatMoney(data.taxAmount)} ₭</span>
            </div>
            <div className="flex justify-between gap-4 border-t pt-2 font-semibold">
              <span>ລວມທັງໝົດ</span>
              <span className="tabular-nums">{formatMoney(data.total)} ₭</span>
            </div>
            <div className="flex justify-between gap-4 text-muted-foreground">
              <span>ຈ່າຍແລ້ວ</span>
              <span className="tabular-nums">{formatMoney(data.paidTotal)} ₭</span>
            </div>
            <div className="flex justify-between gap-4 font-medium">
              <span>ຄ້າງຊຳລະ</span>
              <span className="tabular-nums">{formatMoney(data.balance)} ₭</span>
            </div>
          </div>

          {data.payments.length > 0 ? (
            <div className="rounded-xl border bg-muted/10 p-4">
              <p className="mb-2 font-medium text-sm">ປະຫວັດການຊຳລະ</p>
              <ul className="space-y-2 text-sm">
                {data.payments.map((payment) => (
                  <li
                    key={`${payment.paidAt}-${payment.amount}-${payment.method}`}
                    className="flex justify-between gap-3 border-b border-dashed pb-2 last:border-0 last:pb-0"
                  >
                    <span>
                      {getPaymentMethodLabel(payment.method)} —{" "}
                      {format(new Date(payment.paidAt), "dd/MM/yyyy HH:mm")}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatMoney(payment.amount)} ₭
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-center text-muted-foreground text-xs">
            ເອກະສານນີ້ອອກຈາກລະບົບຄອມພິວເຕີ — Computer-generated invoice verification
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
