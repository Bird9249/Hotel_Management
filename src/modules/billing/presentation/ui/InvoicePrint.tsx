import { format } from "date-fns";
import type { InvoiceByIdResult } from "@/modules/billing/domain/types";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import {
  displayInvoiceNumber,
  formatMoney,
  getPaymentMethodLabel,
} from "./invoice-status";

export function InvoicePrint({ invoice }: { invoice: InvoiceByIdResult }) {
  if (!invoice) return null;

  return (
    <div className="invoice-print w-full space-y-4 text-black">
      <div className="border-b pb-4 text-center">
        <h1 className="font-bold text-2xl">ໃບບິນໂຮງແຮມ</h1>
        <p className="text-sm">Hotel Management System</p>
        <p className="mt-2 font-mono text-sm">
          {displayInvoiceNumber(invoice.id)}
        </p>
      </div>

      <div className="grid gap-1 text-sm sm:grid-cols-2">
        <p>
          <span className="text-gray-600">ລູກຄ້າ:</span> {invoice.guestName}
        </p>
        <p>
          <span className="text-gray-600">ຫ້ອງ:</span> {invoice.roomNumber}
        </p>
        <p>
          <span className="text-gray-600">ເຂົ້າ:</span>{" "}
          {format(new Date(invoice.checkInDate), "dd/MM/yyyy")}
        </p>
        <p>
          <span className="text-gray-600">ອອກ:</span>{" "}
          {format(new Date(invoice.checkOutDate), "dd/MM/yyyy")}
        </p>
        <p>
          <span className="text-gray-600">ວັນທີອອກໃບບິນ:</span>{" "}
          {format(new Date(invoice.createdAt), "dd/MM/yyyy HH:mm")}
        </p>
        <p className="flex items-center gap-2">
          <span className="text-gray-600">ສະຖານະ:</span>
          <InvoiceStatusBadge status={invoice.status} />
        </p>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">ລາຍການ</th>
            <th className="py-2 text-right">ຈຳນວນ</th>
            <th className="py-2 text-right">ລາຄາ</th>
            <th className="py-2 text-right">ລວມ</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b border-dashed">
              <td className="py-2">{item.description}</td>
              <td className="py-2 text-right">{item.qty}</td>
              <td className="py-2 text-right">
                {formatMoney(item.unitPrice)} ₭
              </td>
              <td className="py-2 text-right">{formatMoney(item.amount)} ₭</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
        <div className="flex justify-between">
          <span>ຍອດກ່ອນພາສີ</span>
          <span>{formatMoney(invoice.subtotal)} ₭</span>
        </div>
        <div className="flex justify-between">
          <span>ພາສີ ({invoice.taxRate}%)</span>
          <span>{formatMoney(invoice.taxAmount)} ₭</span>
        </div>
        <div className="flex justify-between border-t pt-2 font-bold text-base">
          <span>ລວມທັງໝົດ</span>
          <span>{formatMoney(invoice.total)} ₭</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>ຈ່າຍແລ້ວ</span>
          <span>{formatMoney(invoice.paidTotal)} ₭</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>ຄ້າງຊຳລະ</span>
          <span>{formatMoney(invoice.balance)} ₭</span>
        </div>
      </div>

      {invoice.payments.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold text-sm">ປະຫວັດການຊຳລະ</h3>
          <ul className="space-y-1 text-sm">
            {invoice.payments.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>
                  {getPaymentMethodLabel(p.method)} —{" "}
                  {format(new Date(p.paidAt), "dd/MM/yyyy HH:mm")}
                </span>
                <span>{formatMoney(p.amount)} ₭</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
