import type { InvoiceByIdResult } from "@/modules/billing/domain/types";
import type { HotelBrandingDTO } from "@/modules/settings/domain/contracts";
import { formatDateLocal, formatDateTimeLocal } from "@/shared/lib/date-time";
import { DEFAULT_HOTEL_BRANDING } from "@/shared/lib/hotel-branding-defaults";
import { AppImage } from "@/shared/ui/AppImage";
import { differenceInCalendarDays, parseISO } from "date-fns";
import QRCode from "react-qr-code";
import { buildInvoiceQrValue } from "./invoice-print-qr";
import {
  displayInvoiceNumber,
  formatMoney,
  getInvoiceStatusMeta,
  getPaymentMethodLabel,
} from "./invoice-status";

export type InvoicePrintFormat = "a4" | "thermal";
export type InvoicePrintCopies = 1 | 2;

type InvoicePrintProps = {
  invoice: InvoiceByIdResult;
  branding?: HotelBrandingDTO | null;
  format?: InvoicePrintFormat;
  copies?: InvoicePrintCopies;
};

type ResolvedBranding = {
  name: string;
  nameEn: string | null;
  address: string | null;
  phone: string | null;
  taxId: string | null;
  logoKey: string | null;
};

type InvoicePrintSheetProps = {
  invoice: InvoiceByIdResult;
  hotel: ResolvedBranding;
  format: InvoicePrintFormat;
};

function countNights(checkIn: string, checkOut: string) {
  const nights = differenceInCalendarDays(
    parseISO(checkOut),
    parseISO(checkIn),
  );
  return nights > 0 ? nights : 1;
}

function resolveBranding(branding?: HotelBrandingDTO | null): ResolvedBranding {
  if (!branding) {
    return {
      name: DEFAULT_HOTEL_BRANDING.name,
      nameEn: DEFAULT_HOTEL_BRANDING.nameEn,
      address: DEFAULT_HOTEL_BRANDING.address,
      phone: DEFAULT_HOTEL_BRANDING.phone,
      taxId: DEFAULT_HOTEL_BRANDING.taxId || null,
      logoKey: null,
    };
  }
  return {
    name: branding.name,
    nameEn: branding.nameEn,
    address: branding.address,
    phone: branding.phone,
    taxId: branding.taxId,
    logoKey: branding.logoKey,
  };
}

function InvoicePrintSheet({ invoice, hotel, format }: InvoicePrintSheetProps) {
  const nights = countNights(invoice.checkInDate, invoice.checkOutDate);
  const statusLabel = getInvoiceStatusMeta(invoice.status).label;
  const isPaid = invoice.status === "paid";
  const isThermal = format === "thermal";
  const qrValue = buildInvoiceQrValue(
    invoice.id,
    invoice.verifyToken ?? "",
  );
  const qrSize = isThermal ? 64 : 80;

  return (
    <div
      className={`invoice-print mx-auto space-y-4 p-1 text-black leading-snug ${
        isThermal
          ? "invoice-print--thermal max-w-[72mm] text-[8pt]"
          : "max-w-[180mm] text-[11pt]"
      }`}
      data-print-format={format}
    >
      <header className="border-black border-b-2 pb-3 text-center">
        {hotel.logoKey ? (
          <div className="mx-auto mb-2 h-12 w-36">
            <AppImage
              src={hotel.logoKey}
              alt={hotel.name}
              fit="contain"
              className="size-full"
              showLoading={false}
            />
          </div>
        ) : null}
        <h1
          className={`font-bold tracking-tight ${isThermal ? "text-sm" : "text-xl"}`}
        >
          {hotel.name}
        </h1>
        {hotel.nameEn ? (
          <p className="text-[9pt] text-neutral-600">{hotel.nameEn}</p>
        ) : null}
        {hotel.address ? (
          <p className="mt-1 text-[9pt] text-neutral-700">{hotel.address}</p>
        ) : null}
        {hotel.phone ? (
          <p className="text-[9pt] text-neutral-700">ໂທ: {hotel.phone}</p>
        ) : null}
        {hotel.taxId ? (
          <p className="text-[9pt] text-neutral-700">
            ເລກທະບຽນພາສີ: {hotel.taxId}
          </p>
        ) : null}
        <p
          className={`mt-2 font-semibold ${isThermal ? "text-[10pt]" : "text-base"}`}
        >
          ໃບບິນ / Invoice
        </p>
      </header>

      <section
        className={`grid gap-x-3 gap-y-1 ${isThermal ? "text-[8pt]" : "text-[10pt]"} ${isThermal ? "grid-cols-1" : "grid-cols-2"}`}
      >
        <div>
          <span className="text-neutral-600">ເລກທີ:</span>{" "}
          <span className="font-medium font-mono">
            {displayInvoiceNumber(invoice.id)}
          </span>
        </div>
        <div className={isThermal ? "" : "text-right"}>
          <span className="text-neutral-600">ວັນທີອອກໃບບິນ:</span>{" "}
          {formatDateTimeLocal(invoice.createdAt)}
        </div>
        <div className={isThermal ? "" : "col-span-2"}>
          <span className="text-neutral-600">ສະຖານະ:</span>{" "}
          <span className={isPaid ? "font-semibold" : ""}>{statusLabel}</span>
        </div>
      </section>

      <section
        className={`rounded border border-neutral-300 p-2 ${isThermal ? "text-[8pt]" : "text-[10pt]"}`}
      >
        <div
          className={`grid gap-x-3 gap-y-1 ${isThermal ? "grid-cols-1" : "grid-cols-2"}`}
        >
          <div>
            <span className="text-neutral-600">ລູກຄ້າ:</span>{" "}
            <span className="font-medium">{invoice.guestName}</span>
          </div>
          <div>
            <span className="text-neutral-600">ຫ້ອງ:</span>{" "}
            <span className="font-medium">{invoice.roomNumber}</span>
            {invoice.roomTypeName ? (
              <span className="text-neutral-600">
                {" "}
                ({invoice.roomTypeName})
              </span>
            ) : null}
          </div>
          <div>
            <span className="text-neutral-600">ເຂົ້າພັກ:</span>{" "}
            {formatDateLocal(invoice.checkInDate)}
          </div>
          <div>
            <span className="text-neutral-600">ອອກ:</span>{" "}
            {formatDateLocal(invoice.checkOutDate)}
          </div>
          <div className={isThermal ? "" : "col-span-2"}>
            <span className="text-neutral-600">ຈຳນວນຄືນ:</span> {nights} ຄືນ
          </div>
        </div>
      </section>

      <table
        className={`w-full border-collapse ${isThermal ? "text-[8pt]" : "text-[10pt]"}`}
      >
        <thead>
          <tr className="border-black border-b">
            <th className="py-1.5 text-left font-semibold">ລາຍການ</th>
            {!isThermal ? (
              <>
                <th className="w-14 py-1.5 text-right font-semibold">ຈຳນວນ</th>
                <th className="w-24 py-1.5 text-right font-semibold">ລາຄາ</th>
              </>
            ) : null}
            <th
              className={`py-1.5 text-right font-semibold ${isThermal ? "w-20" : "w-24"}`}
            >
              ລວມ
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr
              key={item.id}
              className="border-neutral-300 border-b border-dashed"
            >
              <td className="py-1.5 pr-1">
                {item.description}
                {isThermal ? (
                  <span className="block text-[7pt] text-neutral-600">
                    {item.qty} × {formatMoney(item.unitPrice)} ₭
                  </span>
                ) : null}
              </td>
              {!isThermal ? (
                <>
                  <td className="py-1.5 text-right tabular-nums">{item.qty}</td>
                  <td className="py-1.5 text-right tabular-nums">
                    {formatMoney(item.unitPrice)} ₭
                  </td>
                </>
              ) : null}
              <td className="py-1.5 text-right tabular-nums">
                {formatMoney(item.amount)} ₭
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section
        className={`ml-auto space-y-1 ${isThermal ? "w-full text-[8pt]" : "w-full max-w-[72mm] text-[10pt]"}`}
      >
        <div className="flex justify-between gap-2">
          <span className="text-neutral-700">ຍອດກ່ອນພາສີ</span>
          <span className="tabular-nums">
            {formatMoney(invoice.subtotal)} ₭
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-neutral-700">ພາສີ ({invoice.taxRate}%)</span>
          <span className="tabular-nums">
            {formatMoney(invoice.taxAmount)} ₭
          </span>
        </div>
        <div
          className={`flex justify-between gap-2 border-black border-t pt-1.5 font-bold ${isThermal ? "text-[9pt]" : "text-[12pt]"}`}
        >
          <span>ລວມທັງໝົດ</span>
          <span className="tabular-nums">{formatMoney(invoice.total)} ₭</span>
        </div>
        <div className="flex justify-between gap-2 text-neutral-700">
          <span>ຈ່າຍແລ້ວ</span>
          <span className="tabular-nums">
            {formatMoney(invoice.paidTotal)} ₭
          </span>
        </div>
        <div className="flex justify-between gap-2 font-medium">
          <span>ຄ້າງຊຳລະ</span>
          <span className="tabular-nums">{formatMoney(invoice.balance)} ₭</span>
        </div>
      </section>

      {isPaid ? (
        <p className="border border-neutral-400 py-1.5 text-center font-semibold text-[9pt]">
          ຮັບເງິນຄົບແລ້ວ — Paid in full
        </p>
      ) : null}

      {invoice.payments.length > 0 ? (
        <section>
          <h3
            className={`mb-1.5 border-neutral-300 border-b pb-1 font-semibold ${isThermal ? "text-[8pt]" : "text-[10pt]"}`}
          >
            ປະຫວັດການຊຳລະ
          </h3>
          <ul
            className={`space-y-1 ${isThermal ? "text-[8pt]" : "text-[10pt]"}`}
          >
            {invoice.payments.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-0.5 border-neutral-200 border-b border-dashed pb-1"
              >
                <div className="flex justify-between gap-2">
                  <span>
                    {getPaymentMethodLabel(p.method)} —{" "}
                    {formatDateTimeLocal(p.paidAt)}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {formatMoney(p.amount)} ₭
                  </span>
                </div>
                {p.recordedByName ? (
                  <span className="text-[8pt] text-neutral-600">
                    ຮັບໂດຍ: {p.recordedByName}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {invoice.verifyToken ? (
        <section
          className={`flex flex-col items-center gap-1 pt-1 ${isThermal ? "text-[7pt]" : "text-[8pt]"}`}
        >
          <QRCode
            value={qrValue}
            size={qrSize}
            level="M"
            className="invoice-print-qr"
          />
          <p className="text-neutral-600">ສະແກນເພື່ອກວດສອບໃບບິນ</p>
          <p className="font-mono text-neutral-700">
            {displayInvoiceNumber(invoice.id)}
          </p>
        </section>
      ) : null}

      <footer
        className={`border-neutral-300 border-t pt-3 text-center text-neutral-700 ${isThermal ? "text-[7pt]" : "text-[10pt]"}`}
      >
        <p className="font-medium text-black">ຂອບໃຈທີ່ໃຊ້ບໍລິການ</p>
        <p>Thank you for staying with us</p>
        <p className="mt-1 text-[8pt]">
          ເອກະສານນີ້ອອກຈາກລະບົບຄອມພິວເຕີ — Computer-generated invoice
        </p>
      </footer>
    </div>
  );
}

export function InvoicePrint({
  invoice,
  branding,
  format = "a4",
  copies = 1,
}: InvoicePrintProps) {
  if (!invoice) return null;

  const hotel = resolveBranding(branding);
  const sheetCount = copies === 2 ? 2 : 1;

  return (
    <div className="invoice-print-root">
      {Array.from({ length: sheetCount }, (_, index) => (
        <div
          key={index}
          className={
            index > 0
              ? "invoice-print-copy invoice-print-copy--continued"
              : "invoice-print-copy"
          }
        >
          <InvoicePrintSheet invoice={invoice} hotel={hotel} format={format} />
        </div>
      ))}
    </div>
  );
}
