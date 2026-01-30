/**
 * DateTime utilities – ใช้ร่วมกันได้ทั้ง frontend และ backend
 *
 * ## Backend
 * - **เขียนลง DB / ส่งเข้า audit**: ใช้ `nowISO()` เท่านั้น (ได้ ISO string UTC)
 * - **รับค่าจาก request**: รับเป็น ISO string แล้วใช้ `parseISO(s)` ถ้าต้องการเป็น Date
 * - **Query / logic**: คิดเป็น UTC เสมอ ใช้ Date หรือ ISO string ที่มีความหมายเป็น UTC
 *
 * ## Frontend
 * - **แสดงผล**: ใช้ `formatDateTimeLocal(date)` หรือ `formatDateLocal(date)` (ตาม timezone ของ browser)
 *     ถ้ามี user timezone (เช่น จาก settings) ใช้ `formatInTimezone(date, tz, formatStr)`
 * - **ส่งค่าไป API (POST/PUT)**: ส่งเป็น ISO string เช่น `date.toISOString()` (หรือใช้ `toISOForAPI(date)`)
 * - **รับค่าจาก API**: API ส่ง ISO มาแล้ว parse เป็น Date ได้เลย เช่น `new Date(isoString)` แล้วค่อย format แสดง
 *
 * ## หลักการ
 * - DB เก็บเป็น timestamp with time zone (UTC)
 * - API ส่งรับเป็น ISO 8601 string
 * - แสดงผลตาม timezone ผู้ใช้ (browser หรือ user setting)
 */

import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

// ============== Backend ==============

/**
 * เวลาปัจจุบันเป็น ISO 8601 string (UTC)
 *
 * **ใช้เมื่อ**: เขียนค่า createdAt/updatedAt ลง DB, ส่ง occurredAt เข้า audit payload
 * **ไม่ใช้**: แสดงผลให้ user (ให้ใช้ฟังก์ชัน format ฝั่ง frontend แทน)
 *
 * @example
 * // ใน repo หรือ service
 * const now = nowISO();
 * await db.insert(table).values({ createdAt: now, updatedAt: now });
 * appendAudit({ ..., occurredAt: now });
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * เวลาปัจจุบัน + N ชั่วโมง เป็น ISO 8601 string (UTC)
 * ใช้เมื่อตั้งค่า expires (เช่น session หมดอายุใน 24 ชม.)
 */
export function addHoursFromNowISO(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

/**
 * แปลง ISO 8601 string เป็น Date
 * ใช้เมื่อรับค่าจาก request หรือจาก DB (ถ้าได้เป็น string) แล้วต้องคำนวณ/เปรียบเทียบ
 *
 * @param iso - ISO 8601 string (เช่น "2025-01-30T10:00:00.000Z")
 */
export function parseISO(iso: string): Date {
  return new Date(iso);
}

// ============== Frontend – แสดงผล ==============

/**
 * แสดงวันเวลาใน timezone ของ browser (ผู้ใช้)
 * ใช้เมื่อแสดง createdAt, updatedAt, occurredAt ในตารางหรือรายละเอียด
 *
 * @param date - Date object หรือ ISO string จาก API
 * @returns สตริงรูปแบบ "dd/MM/yyyy HH:mm:ss"
 */
export function formatDateTimeLocal(date: Date | string): string {
  return format(new Date(date), "dd/MM/yyyy HH:mm:ss");
}

/**
 * แสดงเฉพาะวันที่ใน timezone ของ browser
 *
 * @param date - Date object หรือ ISO string จาก API
 * @returns สตริงรูปแบบ "dd/MM/yyyy"
 */
export function formatDateLocal(date: Date | string): string {
  return format(new Date(date), "dd/MM/yyyy");
}

/**
 * วันที่รูปแบบ yyyy-MM-dd (สำหรับ date input, query param, filter)
 * ใช้ใน timezone ของ browser
 */
export function formatDateForInput(date: Date | string): string {
  return format(new Date(date), "yyyy-MM-dd");
}

/**
 * แสดงวันเวลาใน timezone ที่กำหนด (เช่น จาก user settings หรือ region)
 * ใช้เมื่อแอปรองรับหลายประเทศและให้ user เลือก timezone ได้
 *
 * @param date - Date object หรือ ISO string
 * @param timezone - IANA timezone (เช่น "Asia/Singapore", "Asia/Bangkok")
 * @param formatStr - รูปแบบ date-fns (default: "yyyy-MM-dd HH:mm:ss")
 */
export function formatInTimezone(
  date: Date | string,
  timezone: string,
  formatStr = "yyyy-MM-dd HH:mm:ss",
): string {
  return formatInTimeZone(new Date(date), timezone, formatStr);
}

/**
 * แสดงวันเวลาใน Asia/Bangkok (UTC+7)
 * ใช้เมื่อต้องการแสดงผลแบบคงที่ตาม region ลาว/ไทย (ไม่ตาม browser)
 */
export function formatInBangkok(
  date: Date | string,
  formatStr = "yyyy-MM-dd HH:mm:ss",
): string {
  return formatInTimeZone(new Date(date), "Asia/Bangkok", formatStr);
}

// ============== Frontend – ส่งค่าไป API ==============

/**
 * แปลง Date เป็น ISO string สำหรับส่งใน body ของ POST/PUT
 * ใช้เมื่อฟอร์มมีฟิลด์วันที่ (เช่น วันหมดอายุแบน) แล้วจะส่งไป backend
 *
 * @param date - Date จาก form state หรือ date picker
 * @returns ISO 8601 string หรือ undefined ถ้าไม่มีค่า
 */
export function toISOForAPI(
  date: Date | string | null | undefined,
): string | undefined {
  if (date == null) return undefined;
  const d = typeof date === "string" ? new Date(date) : date;
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

// ============== Aliases (backward compatibility) ==============

/** @deprecated ใช้ formatDateTimeLocal แทน – แสดงวันเวลาใน timezone ของ browser */
export function formatDateTime(date: Date | string): string {
  return formatDateTimeLocal(date);
}

/** @deprecated ใช้ formatDateLocal แทน – แสดงเฉพาะวันที่ใน timezone ของ browser */
export function formatDate(date: Date | string): string {
  return formatDateLocal(date);
}

/** @deprecated ใช้ formatInBangkok แทน ถ้าต้องการแสดงใน Asia/Bangkok */
export function formatInLao(
  date: Date | string,
  formatStr = "yyyy-MM-dd HH:mm:ss",
): string {
  return formatInBangkok(date, formatStr);
}
