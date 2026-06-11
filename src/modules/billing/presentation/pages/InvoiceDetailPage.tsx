import { useNavigate, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeftIcon, Banknote, Printer } from "lucide-react";
import { useState } from "react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { Button, Card, CardContent, toast } from "@/components/kit";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import { QueryState } from "@/shared/ui/QueryState";
import { useAddPayment, useInvoiceQuery } from "../api/queries";
import { AddPaymentDialog } from "../ui/AddPaymentDialog";
import { InvoicePrint } from "../ui/InvoicePrint";
import { InvoiceStatusBadge } from "../ui/InvoiceStatusBadge";
import {
  displayInvoiceNumber,
  formatMoney,
  getPaymentMethodLabel,
} from "../ui/invoice-status";

export function InvoiceDetailPage() {
  const nav = useNavigate({ from: "/app/invoices/$id" });
  const { id } = useParams({ from: "/app/invoices/$id" });
  const { data, ...result } = useInvoiceQuery(id);
  const addPayment = useAddPayment(id);
  const canPay = useActionPermission(["billing:payment"]);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const handlePrint = () => window.print();

  return (
    <>
      <div className="print:hidden">
        <Header />
        <Main>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => nav({ to: "/app/invoices" })}
            >
              <ArrowLeftIcon className="size-4" />
              ກັບຄືນ
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="size-4" />
                ພິມ
              </Button>
              {canPay && data && data.status !== "paid" && (
                <Button onClick={() => setPaymentOpen(true)}>
                  <Banknote className="size-4" />
                  ບັນທຶກການຊຳລະ
                </Button>
              )}
            </div>
          </div>

          <QueryState
            result={result}
            title="ກໍາລັງໂຫຼດໃບບິນ"
            description="ກໍາລັງດຶງລາຍລະອຽດ"
            variant="fullscreen"
          >
            {!data ? null : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-2xl tracking-tight">ໃບບິນ</h2>
                    <p className="font-mono text-muted-foreground text-sm">
                      {displayInvoiceNumber(data.id)}
                    </p>
                  </div>
                  <InvoiceStatusBadge status={data.status} />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-muted-foreground text-xs">ລວມທັງໝົດ</p>
                      <p className="font-bold text-xl">
                        {formatMoney(data.total)} ₭
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-muted-foreground text-xs">ຈ່າຍແລ້ວ</p>
                      <p className="font-bold text-emerald-600 text-xl">
                        {formatMoney(data.paidTotal)} ₭
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-muted-foreground text-xs">ຄ້າງຊຳລະ</p>
                      <p className="font-bold text-rose-600 text-xl">
                        {formatMoney(data.balance)} ₭
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="space-y-4 p-4">
                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                      <p>
                        <span className="text-muted-foreground">ລູກຄ້າ:</span>{" "}
                        {data.guestName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">ຫ້ອງ:</span>{" "}
                        {data.roomNumber}
                      </p>
                      <p>
                        <span className="text-muted-foreground">ເຂົ້າ–ອອກ:</span>{" "}
                        {format(new Date(data.checkInDate), "dd/MM/yyyy")} –{" "}
                        {format(new Date(data.checkOutDate), "dd/MM/yyyy")}
                      </p>
                      <p>
                        <span className="text-muted-foreground">
                          ວັນທີອອກໃບບິນ:
                        </span>{" "}
                        {format(new Date(data.createdAt), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-muted-foreground">
                            <th className="py-2 pr-4">ລາຍການ</th>
                            <th className="py-2 pr-4 text-right">ຈຳນວນ</th>
                            <th className="py-2 pr-4 text-right">ລາຄາ</th>
                            <th className="py-2 text-right">ລວມ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-dashed"
                            >
                              <td className="py-2 pr-4">{item.description}</td>
                              <td className="py-2 pr-4 text-right">
                                {item.qty}
                              </td>
                              <td className="py-2 pr-4 text-right">
                                {formatMoney(item.unitPrice)} ₭
                              </td>
                              <td className="py-2 text-right">
                                {formatMoney(item.amount)} ₭
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="ml-auto max-w-xs space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ຍອດກ່ອນພາສີ</span>
                        <span>{formatMoney(data.subtotal)} ₭</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          ພາສີ ({data.taxRate}%)
                        </span>
                        <span>{formatMoney(data.taxAmount)} ₭</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>ລວມ</span>
                        <span>{formatMoney(data.total)} ₭</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {data.payments.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="mb-3 font-semibold">ປະຫວັດການຊຳລະ</h3>
                      <ul className="divide-y">
                        {data.payments.map((p) => (
                          <li
                            key={p.id}
                            className="flex justify-between py-2 text-sm"
                          >
                            <span>
                              {getPaymentMethodLabel(p.method)} —{" "}
                              {format(new Date(p.paidAt), "dd/MM/yyyy HH:mm")}
                            </span>
                            <span className="font-medium">
                              {formatMoney(p.amount)} ₭
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <AddPaymentDialog
                  open={paymentOpen}
                  onOpenChange={setPaymentOpen}
                  balance={data.balance}
                  submitting={addPayment.isPending}
                  onSubmit={async (vals) => {
                    try {
                      await addPayment.mutateAsync(vals);
                      toast.success("ບັນທຶກການຊຳລະສໍາເລັດ");
                      setPaymentOpen(false);
                    } catch {
                      // fetcher shows error toast
                    }
                  }}
                />
              </div>
            )}
          </QueryState>
        </Main>
      </div>

      {data && (
        <div className="hidden w-full print:block">
          <InvoicePrint invoice={data} />
        </div>
      )}
    </>
  );
}
