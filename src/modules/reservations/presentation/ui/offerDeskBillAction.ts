import type { NavigateOptions } from "@tanstack/react-router";
import { confirm, toast } from "@/components/kit";
import { billingApi } from "@/modules/billing/presentation/api/client";
import { getApiErrorAlert } from "@/shared/lib/api-errors";
import { reservationsApi } from "../api/client";

type DeskActionKind = "check-in" | "check-out";

type OfferDeskBillActionParams = {
  reservationId: string;
  guestName: string;
  roomNumber: string;
  kind: DeskActionKind;
  canInvoice: boolean;
  navigate: (opts: NavigateOptions) => void;
};

async function loadInvoice(reservationId: string) {
  const result = await reservationsApi.getInvoice(reservationId);
  return result.invoice;
}

async function navigateToInvoice(
  navigate: (opts: NavigateOptions) => void,
  invoiceId: string,
) {
  navigate({
    to: "/app/invoices/$id",
    params: { id: invoiceId },
  });
}

async function createAndNavigate(
  reservationId: string,
  navigate: (opts: NavigateOptions) => void,
) {
  try {
    const created = await toast
      .promise(
        billingApi.create({
          reservationId,
          taxRate: 10,
          extraItems: [],
        }),
        {
          loading: "ກໍາລັງສ້າງໃບບິນ...",
          success: "ສ້າງໃບບິນສໍາເລັດ",
          error: "ສ້າງໃບບິນລົ້ມເຫຼວ",
        },
      )
      .unwrap();
    await navigateToInvoice(navigate, created.id);
  } catch (e) {
    const code = e instanceof Error ? e.message : String(e);
    const alert = getApiErrorAlert(code);
    if (code === "INVOICE_EXISTS") {
      const invoice = await loadInvoice(reservationId);
      if (invoice) {
        await navigateToInvoice(navigate, invoice.id);
        return;
      }
    }
    toast.error(alert?.title ?? "ສ້າງໃບບິນລົ້ມເຫຼວ", {
      description: alert?.description,
    });
  }
}

export async function offerDeskBillAction({
  reservationId,
  guestName,
  roomNumber,
  kind,
  canInvoice,
  navigate,
}: OfferDeskBillActionParams) {
  const doneTitle = kind === "check-in" ? "ເຊັກອິນສໍາເລັດ" : "ເຊັກເອົາສໍາເລັດ";
  const doneDescription = `${guestName} ຫ້ອງ ${roomNumber}`;

  if (!canInvoice) {
    await confirm({
      title: doneTitle,
      description: doneDescription,
      actionText: "ເຂົ້າໃຈ",
      cancelText: "ປິດ",
    });
    return;
  }

  if (kind === "check-out") {
    let existing: { id: string } | null = null;
    try {
      existing = await loadInvoice(reservationId);
    } catch {
      toast.error("ໂຫຼດຂໍ້ມູນໃບບິນລົ້ມເຫຼວ");
      return;
    }

    if (!existing) {
      await createAndNavigate(reservationId, navigate);
      return;
    }

    const wantBill = await confirm({
      title: doneTitle,
      description: `${doneDescription}\nມີໃບບິນຂອງການຈອງນີ້ແລ້ວ`,
      actionText: "ເບິ່ງໃບບິນ",
      cancelText: "ປິດ",
    });
    if (wantBill) await navigateToInvoice(navigate, existing.id);
    return;
  }

  const wantBill = await confirm({
    title: doneTitle,
    description: `${doneDescription}\nຕ້ອງການສ້າງ ຫຼື ເບິ່ງໃບບິນດຽວນີ້ບໍ?`,
    actionText: "ໃບບິນ",
    cancelText: "ປິດ",
  });

  if (!wantBill) return;

  let existing: { id: string } | null = null;
  try {
    existing = await loadInvoice(reservationId);
  } catch {
    toast.error("ໂຫຼດຂໍ້ມູນໃບບິນລົ້ມເຫຼວ");
    return;
  }

  if (existing) {
    await navigateToInvoice(navigate, existing.id);
    return;
  }

  await createAndNavigate(reservationId, navigate);
}
