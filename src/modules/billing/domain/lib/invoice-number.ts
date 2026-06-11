/** e.g. INV-20260611-0001 */
export const INVOICE_NUMBER_PATTERN = /^INV-\d{8}-\d{4}$/;

export function isFormattedInvoiceNumber(id: string) {
  return INVOICE_NUMBER_PATTERN.test(id);
}

export function formatInvoiceNumber(date: Date, sequence: number) {
  const ymd = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  return `INV-${ymd}-${String(sequence).padStart(4, "0")}`;
}

export function displayInvoiceNumber(id: string) {
  if (isFormattedInvoiceNumber(id)) return id;
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}
