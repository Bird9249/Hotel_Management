import { Elysia } from "elysia";
import { Permissions } from "@/modules/roles/domain/contracts/permissions";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { runInTransaction } from "@/server/platform/db/transaction";
import { serverContext } from "@/server/platform/http/context";
import { OffsetPageQuerySchema } from "@/shared/contracts/base";
import {
  AddPaymentSchema,
  CloseShiftSchema,
  CreateInvoiceSchema,
  InvoiceIdParamSchema,
  OpenShiftSchema,
  ShiftIdParamSchema,
} from "../contracts";
import { createInvoiceVerifyToken } from "../lib/invoice-verify-token";
import { getInvoiceById } from "../repo/get-invoice-by-id";
import { getShiftById } from "../repo/get-shift-by-id";
import { listInvoices } from "../repo/list-invoices";
import { listPaymentsByInvoice } from "../repo/list-payments-by-invoice";
import { listShifts } from "../repo/list-shifts";
import { addPaymentService } from "../service/add-payment";
import { closeShiftService } from "../service/close-shift";
import { createInvoiceService } from "../service/create-invoice";
import { getCurrentShiftService } from "../service/get-current-shift";
import { openShiftService } from "../service/open-shift";

export const hotelBillingRoutes = new Elysia()
  .use(serverContext)
  .get("/invoices", async ({ db, query }) => listInvoices(query, db), {
    beforeHandle: requirePermission(Permissions.billing.read),
    query: OffsetPageQuerySchema,
  })
  .get(
    "/invoices/:id",
    async ({ db, params, status }) => {
      const item = await getInvoiceById(params.id, db);
      if (!item) return status(404, { error: "NOT_FOUND" });
      return {
        ...item,
        verifyToken: createInvoiceVerifyToken(item.id),
      };
    },
    {
      beforeHandle: requirePermission(Permissions.billing.read),
      params: InvoiceIdParamSchema,
    },
  )
  .post(
    "/invoices",
    async ({ db, body, status }) => {
      try {
        const out = await runInTransaction(db, (tx) =>
          createInvoiceService(tx, { input: body }),
        );
        return status(201, out.created);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "RESERVATION_NOT_FOUND")
          return status(404, { error: "NOT_FOUND" });
        if (
          message === "INVALID_RESERVATION_STATE" ||
          message === "INVOICE_EXISTS"
        )
          return status(409, { error: message });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.billing.invoice),
      body: CreateInvoiceSchema,
    },
  )
  .get(
    "/invoices/:id/payments",
    async ({ db, params, status }) => {
      const invoice = await getInvoiceById(params.id, db);
      if (!invoice) return status(404, { error: "NOT_FOUND" });
      return listPaymentsByInvoice(params.id, db);
    },
    {
      beforeHandle: requirePermission(Permissions.billing.read),
      params: InvoiceIdParamSchema,
    },
  )
  .post(
    "/invoices/:id/payments",
    async ({ db, params, body, status, user }) => {
      try {
        const out = await runInTransaction(db, (tx) =>
          addPaymentService(tx, {
            invoiceId: params.id,
            input: body,
            actorId: user?.id,
          }),
        );
        return status(201, out);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "INVOICE_NOT_FOUND")
          return status(404, { error: "NOT_FOUND" });
        if (message === "INVOICE_ALREADY_PAID")
          return status(409, { error: "INVOICE_ALREADY_PAID" });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.billing.payment),
      params: InvoiceIdParamSchema,
      body: AddPaymentSchema,
    },
  )
  .get(
    "/cash-shifts/current",
    async ({ db }) => {
      const result = await getCurrentShiftService(db);
      // Elysia serializes bare `null` as an empty body; clients need JSON `null`.
      if (result === null) {
        return new Response(JSON.stringify(null), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return result;
    },
    {
      beforeHandle: requirePermission(Permissions.billing.shift),
    },
  )
  .post(
    "/cash-shifts/open",
    async ({ db, body, status, user }) => {
      if (!user?.id) return status(401, { error: "UNAUTHORIZED" });
      try {
        const out = await runInTransaction(db, (tx) =>
          openShiftService(tx, {
            input: body,
            userId: user.id,
          }),
        );
        return status(201, out);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "SHIFT_ALREADY_OPEN")
          return status(409, { error: message });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.billing.shift),
      body: OpenShiftSchema,
    },
  )
  .post(
    "/cash-shifts/:id/close",
    async ({ db, params, body, status, user, permissions }) => {
      if (!user?.id) return status(401, { error: "UNAUTHORIZED" });
      try {
        const canCloseAnyShift = permissions.includes(Permissions.users.read);
        const out = await runInTransaction(db, (tx) =>
          closeShiftService(tx, {
            shiftId: params.id,
            input: body,
            userId: user.id,
            canCloseAnyShift,
          }),
        );
        return out;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "SHIFT_NOT_FOUND")
          return status(404, { error: "NOT_FOUND" });
        if (message === "SHIFT_NOT_OPEN" || message === "SHIFT_NOT_OWNER")
          return status(409, { error: message });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.billing.shift),
      params: ShiftIdParamSchema,
      body: CloseShiftSchema,
    },
  )
  .get("/cash-shifts", async ({ db, query }) => listShifts(query, db), {
    beforeHandle: requirePermission(Permissions.users.read),
    query: OffsetPageQuerySchema,
  })
  .get(
    "/cash-shifts/:id",
    async ({ db, params, status, user, permissions }) => {
      const item = await getShiftById(params.id, db);
      if (!item) return status(404, { error: "NOT_FOUND" });

      const isAdmin = permissions.includes(Permissions.users.read);
      const isOwner = user?.id === item.openedByUserId;
      if (!isAdmin && !isOwner) return status(403, { error: "FORBIDDEN" });

      return item;
    },
    {
      beforeHandle: requirePermission(Permissions.billing.shift),
      params: ShiftIdParamSchema,
    },
  );
