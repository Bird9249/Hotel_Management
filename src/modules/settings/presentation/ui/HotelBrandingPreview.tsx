import { Badge } from "@/components/kit";
import { AppImage } from "@/shared/ui/AppImage";

type HotelBrandingPreviewProps = {
  name: string;
  nameEn?: string;
  address?: string;
  phone?: string;
  taxId?: string;
  logoKey?: string | null;
};

export function HotelBrandingPreview({
  name,
  nameEn,
  address,
  phone,
  taxId,
  logoKey,
}: HotelBrandingPreviewProps) {
  const displayName = name.trim() || "ໂຮງແຮມ [ຊື່ໂຮງແຮມ]";

  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-6">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-sm">ຕົວຢ່າງຫົວໃບບິນ</span>
        <Badge variant="secondary" className="font-normal">
          Live preview
        </Badge>
      </div>

      <div
        aria-hidden
        className="overflow-hidden rounded-xl border bg-white text-black shadow-sm ring-1 ring-black/5"
      >
        <div className="border-black/10 border-b bg-neutral-50 px-3 py-2 text-center text-[10px] text-neutral-500 uppercase tracking-wide">
          A4 · Thermal 80mm
        </div>

        <div className="space-y-2 p-5 text-center leading-snug">
          {logoKey ? (
            <div className="mx-auto mb-2 h-12 w-36">
              <AppImage
                src={logoKey}
                alt={displayName}
                fit="contain"
                className="size-full"
                showLoading={false}
              />
            </div>
          ) : (
            <div className="mx-auto mb-2 flex h-12 w-36 items-center justify-center rounded-md border border-black/10 border-dashed bg-neutral-50 text-[10px] text-neutral-400">
              ຍັງບໍ່ມີໂລໂກ້
            </div>
          )}

          <h3 className="font-bold text-base tracking-tight">{displayName}</h3>
          {nameEn?.trim() ? (
            <p className="text-neutral-600 text-xs">{nameEn.trim()}</p>
          ) : null}
          {address?.trim() ? (
            <p className="text-[11px] text-neutral-700">{address.trim()}</p>
          ) : null}
          {phone?.trim() ? (
            <p className="text-[11px] text-neutral-700">ໂທ: {phone.trim()}</p>
          ) : null}
          {taxId?.trim() ? (
            <p className="text-[11px] text-neutral-700">
              ເລກທະບຽນພາສີ: {taxId.trim()}
            </p>
          ) : null}

          <p className="mt-3 border-black/10 border-t pt-3 font-semibold text-sm">
            ໃບບິນ / Invoice
          </p>
        </div>
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed">
        ສະແດງຕົວຢ່າງຫົວໃບບິນຕາມຂໍ້ມູນທີ່ກຳລັງແກ້ໄຂ — ອັບເດດທັນທີກ່ອນກົດບັນທຶກ
      </p>
    </div>
  );
}
