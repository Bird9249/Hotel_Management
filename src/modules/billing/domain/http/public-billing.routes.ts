import { Elysia } from "elysia";
import { serverContext } from "@/server/platform/http/context";
import {
  InvoiceVerifyQuerySchema,
} from "../contracts/invoice-verify";
import { InvoiceIdParamSchema } from "../contracts/invoice";
import { verifyInvoiceToken } from "../lib/invoice-verify-token";
import { verifyInvoicePublicService } from "../service/verify-invoice-public";

export const publicBillingRoutes = new Elysia().use(serverContext).get(
  "/invoices/:id/verify",
  async ({ db, params, query, status }) => {
    if (!verifyInvoiceToken(params.id, query.t)) {
      return status(403, { error: "INVALID_TOKEN" });
    }

    const result = await verifyInvoicePublicService(db, params.id);
    if (!result) return status(404, { error: "NOT_FOUND" });
    return result;
  },
  {
    params: InvoiceIdParamSchema,
    query: InvoiceVerifyQuerySchema,
  },
);
