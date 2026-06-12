import {
  Building2,
  FileText,
  ImageIcon,
  MapPin,
  Receipt,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormInput,
  FormRoot,
  FormTextarea,
  RHF,
  Separator,
  Skeleton,
  toast,
  zodResolver,
} from "@/components/kit";
import {
  type HotelBrandingInput,
  HotelBrandingSchema,
} from "@/modules/settings/domain/contracts";
import { ImageKeyUploadField } from "@/shared/ui/ImageKeyUploadField";
import { useHotelBrandingQuery, useUpdateHotelBranding } from "../api/queries";
import { HotelBrandingPreview } from "./HotelBrandingPreview";

type FormValues = HotelBrandingInput;

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-sm">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="ps-0 sm:ps-12">{children}</div>
    </section>
  );
}

function BrandingFormSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

export function HotelBrandingSection() {
  const branding = useHotelBrandingQuery();
  const update = useUpdateHotelBranding();

  const methods = RHF.useForm<FormValues>({
    resolver: zodResolver(HotelBrandingSchema),
    values: branding.data
      ? {
          name: branding.data.name,
          nameEn: branding.data.nameEn ?? "",
          address: branding.data.address ?? "",
          phone: branding.data.phone ?? "",
          taxId: branding.data.taxId ?? "",
          logoKey: branding.data.logoKey,
        }
      : undefined,
  });

  const watched = methods.watch();
  const isDirty = methods.formState.isDirty;

  return (
    <Card>
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-muted-foreground" />
              ຂໍ້ມູນໂຮງແຮມ (ໃບບິນ)
            </CardTitle>
            <CardDescription className="max-w-2xl">
              ຕັ້ງຄ່າຊື່, ໂລໂກ້, ທີ່ຢູ່ ແລະ ຂໍ້ມູນພາສີທີ່ຈະສະແດງເວລາພິມໃບບິນໃຫ້ລູກຄ້າ.
            </CardDescription>
          </div>
          {isDirty ? (
            <Badge variant="secondary">ມີການປ່ຽນແປງ</Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {branding.isLoading ? (
          <BrandingFormSkeleton />
        ) : (
          <FormRoot<FormValues>
            methods={methods}
            onSubmit={async (vals) => {
              try {
                await update.mutateAsync({
                  name: vals.name,
                  nameEn: vals.nameEn || undefined,
                  address: vals.address || undefined,
                  phone: vals.phone || undefined,
                  taxId: vals.taxId || undefined,
                  logoKey: vals.logoKey ?? null,
                });
                methods.reset(vals);
                toast.success("ບັນທຶກຂໍ້ມູນໂຮງແຮມສຳເລັດ");
              } catch {
                // fetcher toast
              }
            }}
            className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"
          >
            <div className="flex flex-col gap-6">
              <FormSection
                icon={ImageIcon}
                title="ໂລໂກ້ໂຮງແຮມ"
                description="ແນະນຳອັດຕາສ່ວນ 3:1 ແລະ ພື້ນຫຼັງໂປຣງ — ໃຊ້ໃນຫົວໃບບິນ A4 ແລະ Thermal."
              >
                <div className="rounded-xl border bg-muted/20 p-4">
                  <ImageKeyUploadField
                    label="ໂລໂກ້"
                    keyPrefix="uploads/hotel-logo"
                    value={methods.watch("logoKey") ?? ""}
                    onChange={(key) =>
                      methods.setValue("logoKey", key || null, {
                        shouldDirty: true,
                      })
                    }
                    aspectRatio="aspect-[3/1]"
                    aspectHint="3:1"
                    widthPx={360}
                    heightPx={120}
                    disabled={update.isPending}
                  />
                </div>
              </FormSection>

              <Separator />

              <FormSection
                icon={FileText}
                title="ຊື່ໂຮງແຮມ"
                description="ຊື່ພາສາລາວຈຳເປັນ — ຊື່ພາສາອັງກິດສະແດງໃຕ້ຊື່ຫຼັກໃນໃບບິນ."
              >
                <div className="grid gap-4">
                  <FormInput name="name" label="ຊື່ໂຮງແຮມ (ລາວ)" requiredMark />
                  <FormInput name="nameEn" label="ຊື່ (ອັງກິດ)" />
                </div>
              </FormSection>

              <Separator />

              <FormSection
                icon={MapPin}
                title="ທີ່ຢູ່ ແລະ ການຕິດຕໍ່"
                description="ຂໍ້ມູນເຫຼົ່ານີ້ຈະປາກົດໃຕ້ຊື່ໂຮງແຮມໃນຫົວໃບບິນ."
              >
                <div className="grid gap-4">
                  <FormTextarea name="address" label="ທີ່ຢູ່" rows={3} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      name="phone"
                      label="ເບີໂທ"
                      placeholder="+856 20 XXXX XXXX"
                    />
                    <FormInput
                      name="taxId"
                      label="ເລກທະບຽນພາສີ"
                      placeholder="0100/00XXXXX"
                    />
                  </div>
                </div>
              </FormSection>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 px-4 py-3">
                <div className="flex items-start gap-2 text-muted-foreground text-sm">
                  <Receipt className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {isDirty
                      ? "ມີການປ່ຽນແປງທີ່ຍັງບໍ່ໄດ້ບັນທຶກ"
                      : "ຂໍ້ມູນຕົງກັບໃບບິນລ່າສຸດ"}
                  </span>
                </div>
                <Button type="submit" isLoading={update.isPending}>
                  ບັນທຶກ
                </Button>
              </div>
            </div>

            <aside className="lg:border-s lg:ps-8">
              <HotelBrandingPreview
                name={watched.name ?? ""}
                nameEn={watched.nameEn}
                address={watched.address}
                phone={watched.phone}
                taxId={watched.taxId}
                logoKey={watched.logoKey}
              />
            </aside>
          </FormRoot>
        )}
      </CardContent>
    </Card>
  );
}
