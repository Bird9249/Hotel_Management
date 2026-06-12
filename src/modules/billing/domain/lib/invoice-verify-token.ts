import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/server/platform/config";

const PEPPER = "hotel-invoice-verify-v1";

function getVerifySecret() {
  return `${env.DATABASE_URL}:${PEPPER}`;
}

/** HMAC token สำหรับลิงก์ verify แบบ public — ไม่เก็บใน DB */
export function createInvoiceVerifyToken(invoiceId: string): string {
  return createHmac("sha256", getVerifySecret())
    .update(invoiceId)
    .digest("base64url")
    .slice(0, 22);
}

export function verifyInvoiceToken(invoiceId: string, token: string): boolean {
  if (!token || token.length < 8) return false;
  const expected = createInvoiceVerifyToken(invoiceId);
  if (expected.length !== token.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

export function buildInvoiceVerifyPath(invoiceId: string, token: string) {
  const params = new URLSearchParams({ t: token });
  return `/verify/invoice/${encodeURIComponent(invoiceId)}?${params.toString()}`;
}
