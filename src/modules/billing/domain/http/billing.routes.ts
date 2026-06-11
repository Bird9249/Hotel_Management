import { Elysia } from "elysia";
import { Permissions } from "@/modules/roles/domain/contracts/permissions";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { OffsetPageQuerySchema } from "@/shared/contracts/base";
import {
  AddPaymentSchema,
  CreateInvoiceSchema,
  InvoiceIdParamSchema,
} from "../contracts";
import { getInvoiceById } from "../repo/get-invoice-by-id";
import { listInvoices } from "../repo/list-invoices";
import { listPaymentsByInvoice } from "../repo/list-payments-by-invoice";
import { addPaymentService } from "../service/add-payment";
import { createInvoiceService } from "../service/create-invoice";

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
      return item;
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
        const out = await createInvoiceService(db, { input: body });
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
    async ({ db, params, body, status }) => {
      try {
        const out = await addPaymentService(db, {
          invoiceId: params.id,
          input: body,
        });
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
  );
