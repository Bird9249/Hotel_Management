import { Elysia } from "elysia";
import { runInTransaction } from "@/server/platform/db/transaction";
import { serverContext } from "@/server/platform/http/context";
import {
  BookingCodeParamSchema,
  BookingHoldParamSchema,
  ConfirmBookingSchema,
  CreateBookingHoldSchema,
  PublicAvailabilityQuerySchema,
} from "../contracts";
import { cancelBookingHoldService } from "../service/cancel-hold";
import { confirmBookingService } from "../service/confirm-booking";
import { createBookingHoldService } from "../service/create-hold";
import { getPublicBookingService } from "../service/get-booking";
import { searchPublicAvailabilityService } from "../service/search-availability";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const rateLimitBuckets = new Map<string, RateLimitBucket>();

function getClientIp(request: Request, ip?: string) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";

  return ip ?? "unknown";
}

function checkPublicBookingRateLimit(params: {
  request: Request;
  ip?: string;
}) {
  const now = Date.now();
  const key = getClientIp(params.request, params.ip);
  const current = rateLimitBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  current.count += 1;
  if (current.count <= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
  };
}

export const publicBookingRoutes = new Elysia()
  .use(serverContext)
  .onBeforeHandle(({ ip, request, set, status }) => {
    if (process.env.PUBLIC_BOOKING_ENABLED === "false") {
      return status(404, { error: "PUBLIC_BOOKING_DISABLED" });
    }

    const rateLimit = checkPublicBookingRateLimit({ request, ip });
    if (!rateLimit.allowed) {
      set.headers["Retry-After"] = String(rateLimit.retryAfterSeconds);
      return status(429, { error: "RATE_LIMITED" });
    }
  })
  .get(
    "/availability",
    async ({ db, query, status }) => {
      try {
        return await searchPublicAvailabilityService(db, { query });
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "INVALID_DATE_RANGE") {
          return status(400, { error: message });
        }
        return status(500, { error: message });
      }
    },
    { query: PublicAvailabilityQuerySchema },
  )
  .post(
    "/holds",
    async ({ db, body, status }) => {
      try {
        const out = await runInTransaction(db, (tx) =>
          createBookingHoldService(tx, { input: body }),
        );
        return status(201, out);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "INVALID_DATE_RANGE") {
          return status(400, { error: message });
        }
        if (message === "ROOM_TYPE_NOT_AVAILABLE") {
          return status(409, { error: message });
        }
        return status(500, { error: message });
      }
    },
    { body: CreateBookingHoldSchema },
  )
  .delete(
    "/holds/:holdId",
    async ({ db, params, status }) => {
      try {
        const out = await runInTransaction(db, (tx) =>
          cancelBookingHoldService(tx, { holdId: params.holdId }),
        );
        return status(200, out);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return status(500, { error: message });
      }
    },
    { params: BookingHoldParamSchema },
  )
  .post(
    "/bookings/confirm",
    async ({ db, body, status }) => {
      try {
        const out = await runInTransaction(db, (tx) =>
          confirmBookingService(tx, { input: body }),
        );
        return status(201, out);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "BOT_DETECTED") {
          return status(400, { error: "INVALID_REQUEST" });
        }
        if (message === "HOLD_NOT_FOUND" || message === "BOOKING_NOT_FOUND") {
          return status(404, { error: message });
        }
        if (
          message === "HOLD_EXPIRED" ||
          message === "ROOM_TYPE_NOT_AVAILABLE"
        ) {
          return status(409, { error: message });
        }
        return status(500, { error: message });
      }
    },
    { body: ConfirmBookingSchema },
  )
  .get(
    "/bookings/:code",
    async ({ db, params, status }) => {
      try {
        return await getPublicBookingService(db, { code: params.code });
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "BOOKING_NOT_FOUND") {
          return status(404, { error: message });
        }
        return status(500, { error: message });
      }
    },
    { params: BookingCodeParamSchema },
  );
