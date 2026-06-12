import type { InvoicePrintFormat } from "./InvoicePrint";

const IFRAME_PRINT_STYLE = `
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #000;
  }
  .invoice-print {
    max-width: none !important;
    width: 100% !important;
    margin: 0 auto !important;
    padding: 0 !important;
    color: #000 !important;
    background: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-print .text-neutral-600,
  .invoice-print .text-neutral-700 {
    color: #404040 !important;
  }
  .invoice-print-qr {
    height: auto !important;
    max-width: 100%;
    width: auto !important;
  }
  .invoice-print img {
    opacity: 1 !important;
  }
`;

function buildPageStyle(format: InvoicePrintFormat) {
  if (format === "thermal") {
    return `@page { size: 80mm auto; margin: 2mm; }
${IFRAME_PRINT_STYLE}
.invoice-print-root { max-width: 72mm; width: 72mm; margin: 0 auto; }
.invoice-print[data-print-format="thermal"] { max-width: 72mm !important; width: 72mm !important; }
.invoice-print-copy--continued { break-before: page; page-break-before: always; }`;
  }

  return `@page { size: A4; margin: 10mm; }
${IFRAME_PRINT_STYLE}
.invoice-print-copy--continued { break-before: page; page-break-before: always; }`;
}

/** พิมพ์เฉพาะ node ใบบิล — ไม่ใช้ window.print() บน document หลัก */
export function printInvoiceNode(
  node: HTMLElement,
  format: InvoicePrintFormat,
) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "invoice-print");
  iframe.setAttribute(
    "style",
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden",
  );
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    return;
  }
  const printDoc = doc;
  const printWin = win;

  printDoc.open();
  printDoc.write("<!DOCTYPE html><html><head></head><body></body></html>");
  printDoc.close();

  for (const sheet of Array.from(
    document.querySelectorAll(
      'link[rel="stylesheet"], style:not([data-invoice-print-page])',
    ),
  )) {
    printDoc.head.appendChild(sheet.cloneNode(true));
  }

  const pageStyle = printDoc.createElement("style");
  pageStyle.dataset.invoicePrintPage = "true";
  pageStyle.textContent = buildPageStyle(format);
  printDoc.head.appendChild(pageStyle);

  printDoc.body.appendChild(node.cloneNode(true));

  // รูปใน AppImage ถูก clone มาพร้อมคลาส opacity-0 + loading="lazy"
  // ซึ่งทำให้ logo ไม่แสดงตอนพิมพ์ — บังคับให้แสดงและโหลดทันที
  const images = Array.from(printDoc.querySelectorAll("img"));
  for (const img of images) {
    img.setAttribute("loading", "eager");
    img.classList.remove("opacity-0");
    img.style.opacity = "1";
  }

  const cleanup = () => {
    iframe.remove();
  };

  const fallbackCleanup = setTimeout(cleanup, 15_000);

  const runPrint = () => {
    printWin.focus();
    printWin.print();
    printWin.onafterprint = () => {
      clearTimeout(fallbackCleanup);
      cleanup();
    };
  };

  const waitForAssets = () => {
    const pending: Promise<unknown>[] = [];

    for (const img of images) {
      if (img.complete && img.naturalWidth > 0) continue;
      pending.push(
        new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
      );
    }

    const stylesheets = Array.from(
      printDoc.querySelectorAll('link[rel="stylesheet"]'),
    );
    for (const link of stylesheets as HTMLLinkElement[]) {
      if (link.sheet) continue;
      pending.push(
        new Promise<void>((resolve) => {
          link.addEventListener("load", () => resolve(), { once: true });
          link.addEventListener("error", () => resolve(), { once: true });
        }),
      );
    }

    // กันค้าง ถ้า asset โหลดช้าเกินไป
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 5_000));

    Promise.race([Promise.all(pending), timeout]).then(() => {
      setTimeout(runPrint, 50);
    });
  };

  waitForAssets();
}
