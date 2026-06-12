/** URL หน้า verify แบบ public — ต้องมี token จาก API */
export function buildInvoiceQrValue(invoiceId: string, verifyToken: string): string {
  const url = new URL(
    `/verify/invoice/${encodeURIComponent(invoiceId)}`,
    window.location.origin,
  );
  url.searchParams.set("t", verifyToken);
  return url.toString();
}
