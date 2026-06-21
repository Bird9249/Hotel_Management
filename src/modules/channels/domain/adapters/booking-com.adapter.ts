import { createMockOtaAdapter } from "./mock-ota.adapter";

/** Booking.com demo adapter — ใช้ mock push/pull จนกว่าจะต่อ API จริง */
export const bookingComAdapter = createMockOtaAdapter("booking_com");
