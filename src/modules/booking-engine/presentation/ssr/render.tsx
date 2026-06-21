import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { renderToReadableStream } from "react-dom/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FieldGroup,
  FieldLabel,
  Field as FieldLayout,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { listRoomTypes } from "@/modules/rooms/domain/repo/list-room-types";
import { ensureHotelBrandingRow } from "@/modules/settings/domain/repo/get-hotel-branding";
import type { DbClient } from "@/server/platform/db/client";
import { db } from "@/server/platform/db/client";
import {
  getBookingHoldStatus,
  releaseBookingHold,
} from "../../domain/repo/holds";
import { getPublicBookingService } from "../../domain/service/get-booking";
import { searchPublicAvailabilityService } from "../../domain/service/search-availability";

type PageOptions = {
  title: string;
  description: string;
  children: React.ReactNode;
  noindex?: boolean;
  canonicalPath?: string;
  publicClient?: boolean;
  script?: string;
  jsonLd?: unknown;
};

type RoomTypeSummary = {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  capacity: number;
};

function toMoney(value: string | number) {
  return new Intl.NumberFormat("lo-LA").format(Number(value));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function roomTypeSlug(roomType: { id: string; name: string }) {
  const slug = slugify(roomType.name) || "room";
  return `${slug}-${roomType.id}`;
}

function getBuiltCssText() {
  return (
    getBuiltAssetText("css", "public-booking-entry") ||
    getBuiltAssetText("css", "index") ||
    getBuiltAssetText("css")
  );
}

function getBuiltPublicBookingClientText() {
  return getBuiltAssetText("js", "public-booking-entry");
}

function getBuiltAssetText(extension: "css" | "js", startsWith?: string) {
  const candidateDirs = [
    join(process.cwd(), "out", "dist"),
    join(process.cwd(), "dist"),
  ];

  for (const distDir of candidateDirs) {
    if (!existsSync(distDir)) continue;

    try {
      return readdirSync(distDir)
        .filter(
          (file) =>
            file.endsWith(`.${extension}`) &&
            (!startsWith || file.startsWith(startsWith)),
        )
        .sort()
        .map((file) => readFileSync(join(distDir, file), "utf8"))
        .join("\n");
    } catch {}
  }

  return "";
}

function PublicFallbackStyles() {
  return (
    <style>{`
      :root {
        --radius: 0.625rem;
        --background: oklch(1 0 0);
        --foreground: oklch(0.145 0 0);
        --card: oklch(1 0 0);
        --card-foreground: oklch(0.145 0 0);
        --primary: oklch(0.205 0 0);
        --primary-foreground: oklch(0.985 0 0);
        --secondary: oklch(0.97 0 0);
        --secondary-foreground: oklch(0.205 0 0);
        --muted: oklch(0.97 0 0);
        --muted-foreground: oklch(0.556 0 0);
        --accent: oklch(0.97 0 0);
        --accent-foreground: oklch(0.205 0 0);
        --border: oklch(0.922 0 0);
        --input: oklch(0.922 0 0);
        --ring: oklch(0.708 0 0);
      }
      body { margin: 0; font-family: "Noto Sans Lao Looped", Inter, ui-sans-serif, system-ui, sans-serif; }
    `}</style>
  );
}

function PageShell({
  hotel,
  options,
}: {
  hotel: Awaited<ReturnType<typeof ensureHotelBrandingRow>>;
  options: PageOptions;
}) {
  const title = `${options.title} | ${hotel.name}`;
  const builtCss = getBuiltCssText();
  const publicClientScript = options.publicClient
    ? getBuiltPublicBookingClientText()
    : "";

  return (
    <html lang="lo">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={options.description} />
        <meta
          name="robots"
          content={options.noindex ? "noindex,nofollow" : "index,follow"}
        />
        {options.canonicalPath ? (
          <link rel="canonical" href={options.canonicalPath} />
        ) : null}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={options.description} />
        <meta property="og:site_name" content={hotel.name} />
        <link rel="icon" href="/logo.svg" />
        {builtCss ? <style>{builtCss}</style> : null}
        <PublicFallbackStyles />
        {options.jsonLd ? (
          <script type="application/ld+json">
            {JSON.stringify(options.jsonLd)}
          </script>
        ) : null}
      </head>
      <body className="bg-background text-foreground">
        <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <a className="font-bold text-lg tracking-tight" href="/book">
              {hotel.name}
            </a>
            {hotel.phone ? (
              <Badge variant="secondary">{hotel.phone}</Badge>
            ) : null}
          </header>
          {options.children}
        </main>
        {options.script ? <script>{options.script}</script> : null}
        {publicClientScript ? (
          <script type="module">{publicClientScript}</script>
        ) : null}
      </body>
    </html>
  );
}

async function renderDocument(client: DbClient, options: PageOptions) {
  const hotel = await ensureHotelBrandingRow(client);
  const stream = await renderToReadableStream(
    <PageShell hotel={hotel} options={options} />,
  );
  return stream;
}

function SearchForm({
  from,
  to,
  guests,
}: {
  from: string;
  to: string;
  guests: number;
}) {
  return (
    <div
      id="booking-search-island"
      data-from={from}
      data-to={to}
      data-guests={guests}
    >
      <Card>
        <CardHeader>
          <CardTitle>ຄົ້ນຫາຫ້ອງວ່າງ</CardTitle>
          <CardDescription>ເລືອກຊ່ວງວັນທີ ແລະ ຈຳນວນຜູ້ເຂົ້າພັກ</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            ກຳລັງໂຫຼດ date picker...
          </p>
          <noscript>
            <form
              action="/book"
              className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]"
              method="get"
            >
              <FieldLayout>
                <FieldLabel htmlFor="from">ວັນເຂົ້າ</FieldLabel>
                <Input
                  id="from"
                  name="from"
                  required
                  type="date"
                  defaultValue={from}
                />
              </FieldLayout>
              <FieldLayout>
                <FieldLabel htmlFor="to">ວັນອອກ</FieldLabel>
                <Input
                  id="to"
                  name="to"
                  required
                  type="date"
                  defaultValue={to}
                />
              </FieldLayout>
              <FieldLayout>
                <FieldLabel htmlFor="guests">ຜູ້ເຂົ້າພັກ</FieldLabel>
                <Input
                  id="guests"
                  min={1}
                  name="guests"
                  type="number"
                  defaultValue={guests}
                />
              </FieldLayout>
              <Button className="self-end" type="submit">
                ຄົ້ນຫາ
              </Button>
            </form>
          </noscript>
        </CardContent>
      </Card>
    </div>
  );
}

function RoomTypeCard({
  item,
}: {
  item: {
    roomTypeId: string;
    roomTypeName: string;
    basePrice: string;
    capacity: number;
    availableRooms: number;
  };
}) {
  const isAvailable = item.availableRooms > 0;

  return (
    <Card className={cn(!isAvailable && "opacity-70")}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{item.roomTypeName}</CardTitle>
            <CardDescription>
              ຮອງຮັບ {item.capacity} ຄົນ · ວ່າງ {item.availableRooms} ຫ້ອງ
            </CardDescription>
          </div>
          <Badge variant={isAvailable ? "default" : "secondary"}>
            {isAvailable ? "ຈອງໄດ້" : "ເຕັມ"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="font-bold text-3xl">{toMoney(item.basePrice)} LAK</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a
              href={`/book/room-types/${roomTypeSlug({
                id: item.roomTypeId,
                name: item.roomTypeName,
              })}`}
            >
              ລາຍລະອຽດ
            </a>
          </Button>
          <Button
            data-bookable={isAvailable ? "true" : "false"}
            data-room-type-id={item.roomTypeId}
            disabled={!isAvailable}
            type="button"
          >
            ຈອງຫ້ອງນີ້
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

async function renderBookPage(request: Request, client: DbClient) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? "";
  const to = url.searchParams.get("to") ?? "";
  const guests = Number(url.searchParams.get("guests") ?? "2");
  const normalizedGuests = Number.isFinite(guests) ? guests : 2;
  const hasSearch = Boolean(from && to && to > from);
  const availability = hasSearch
    ? await searchPublicAvailabilityService(client, {
        query: { from, to, guests: normalizedGuests },
      })
    : null;

  return renderDocument(client, {
    title: "ຈອງຫ້ອງພັກໂດຍກົງ",
    description: "ຄົ້ນຫາຫ້ອງວ່າງ ແລະ ຈອງຫ້ອງພັກກັບໂຮງແຮມໂດຍກົງ",
    canonicalPath: "/book",
    publicClient: true,
    children: (
      <>
        <section className="rounded-3xl bg-primary px-6 py-10 text-primary-foreground md:px-10 md:py-14">
          <Badge className="mb-4" variant="secondary">
            Direct Booking
          </Badge>
          <h1 className="max-w-3xl text-balance font-bold text-4xl tracking-tight md:text-6xl">
            ຈອງຫ້ອງພັກໂດຍກົງກັບໂຮງແຮມ
          </h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/80">
            ເລືອກວັນເຂົ້າພັກ ແລະ ຈອງກັບໂຮງແຮມໂດຍກົງ ບໍ່ຜ່ານ OTA
          </p>
        </section>
        <SearchForm from={from} to={to} guests={normalizedGuests} />
        {hasSearch ? (
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="font-semibold text-2xl">ຫ້ອງທີ່ພ້ອມໃຫ້ຈອງ</h2>
              <p className="text-muted-foreground text-sm">
                ຜົນການຄົ້ນຫາສຳລັບ {normalizedGuests} ຄົນ
              </p>
            </div>
            {availability && availability.roomTypes.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {availability.roomTypes.map((item) => (
                  <RoomTypeCard item={item} key={item.roomTypeId} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  ບໍ່ພົບຫ້ອງວ່າງໃນຊ່ວງວັນນີ້
                </CardContent>
              </Card>
            )}
          </section>
        ) : null}
      </>
    ),
    script: `
      function resetBookingButtons() {
        document.querySelectorAll('[data-room-type-id][data-bookable="true"]').forEach((button) => {
          button.disabled = false;
          button.textContent = 'ຈອງຫ້ອງນີ້';
        });
      }

      window.addEventListener('pageshow', resetBookingButtons);
      resetBookingButtons();

      document.querySelectorAll('[data-room-type-id]').forEach((button) => {
        button.addEventListener('click', async () => {
          if (button.dataset.bookable !== 'true') return;
          button.disabled = true;
          button.textContent = 'ກຳລັງ hold...';
          const roomTypeId = button.getAttribute('data-room-type-id');
          const res = await fetch('/api/public/holds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomTypeId,
              checkInDate: ${JSON.stringify(from)},
              checkOutDate: ${JSON.stringify(to)},
              guestsCount: ${JSON.stringify(normalizedGuests)}
            })
          });
          if (!res.ok) {
            alert('ຫ້ອງນີ້ບໍ່ວ່າງແລ້ວ ກະລຸນາຄົ້ນຫາໃໝ່');
            button.disabled = false;
            button.textContent = 'ຈອງຫ້ອງນີ້';
            return;
          }
          const data = await res.json();
          location.href = '/book/checkout?holdId=' + encodeURIComponent(data.hold.id) + '&guests=' + encodeURIComponent(${JSON.stringify(normalizedGuests)});
        });
      });
    `,
  });
}

async function renderRoomTypePage(request: Request, client: DbClient) {
  const url = new URL(request.url);
  const slug = decodeURIComponent(url.pathname.split("/").pop() ?? "");
  const roomTypes = await listRoomTypes(
    { limit: 100, offset: 0, sort: undefined, filters: undefined },
    client,
  );
  const item =
    roomTypes.data.find((row) => roomTypeSlug(row) === slug) ??
    roomTypes.data.find((row) => row.id === slug);

  if (!item) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: item.name,
    description: item.description,
    occupancy: { "@type": "QuantitativeValue", maxValue: item.capacity },
    offers: {
      "@type": "Offer",
      price: item.basePrice,
      priceCurrency: "LAK",
      availability: "https://schema.org/InStock",
    },
  };

  return renderDocument(client, {
    title: item.name,
    description: item.description ?? `ຈອງ ${item.name} ໂດຍກົງກັບໂຮງແຮມ`,
    canonicalPath: `/book/room-types/${roomTypeSlug(item)}`,
    jsonLd,
    children: <RoomTypeDetail item={item} />,
  });
}

function RoomTypeDetail({ item }: { item: RoomTypeSummary }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="flex flex-col gap-6">
        <div className="overflow-hidden rounded-3xl border bg-card">
          <div className="flex min-h-64 flex-col justify-end bg-[radial-gradient(circle_at_top_left,var(--muted)_0,transparent_34%),linear-gradient(135deg,var(--primary),var(--foreground))] p-6 text-primary-foreground md:p-10">
            <Button asChild className="mb-auto w-fit" variant="secondary">
              <a href="/book">← ກັບໄປຄົ້ນຫາ</a>
            </Button>
            <Badge className="mb-4 w-fit" variant="secondary">
              Direct Booking
            </Badge>
            <h1 className="max-w-2xl text-balance font-bold text-4xl tracking-tight md:text-5xl">
              {item.name}
            </h1>
            <p className="mt-3 max-w-2xl text-primary-foreground/80">
              {item.description ??
                "ຫ້ອງພັກສະດວກສະບາຍ ເໝາະສຳລັບການພັກຜ່ອນ ແລະ ຈອງກັບໂຮງແຮມໂດຍກົງ"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ຈຸດເດັ່ນຂອງຫ້ອງ</CardTitle>
            <CardDescription>ຂໍ້ມູນສຳຄັນສຳລັບການຕັດສິນໃຈຈອງ</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-3">
              <FeatureItem
                description={`ຮອງຮັບຜູ້ເຂົ້າພັກໄດ້ສູງສຸດ ${item.capacity} ຄົນ`}
                icon={<Users />}
                title="ຄວາມຈຸ"
              />
              <FeatureItem
                description="ຈອງກັບໂຮງແຮມໂດຍກົງ ລົດຄ່າຄອມມິດຊັນຈາກ OTA"
                icon={<ShieldCheck />}
                title="ລາຄາຈາກໂຮງແຮມ"
              />
              <FeatureItem
                description="ສາມາດກວດຫ້ອງວ່າງ ແລະ hold inventory ກ່ອນຢືນຢັນ"
                icon={<CalendarDays />}
                title="ຈອງງ່າຍ"
              />
            </ItemGroup>
          </CardContent>
        </Card>
      </section>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <Card className="border-primary/20 shadow-md">
          <CardHeader>
            <CardDescription>ລາຄາເລີ່ມຕົ້ນ</CardDescription>
            <CardTitle className="text-3xl">
              {toMoney(item.basePrice)} LAK
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Users />
                {item.capacity} ຄົນ
              </Badge>
              <Badge variant="outline">
                <BedDouble />
                {item.name}
              </Badge>
            </div>
            <Separator />
            <Alert>
              <CheckCircle2 />
              <AlertTitle>ຈ່າຍທີ່ໂຮງແຮມ</AlertTitle>
              <AlertDescription>
                ການຈອງນີ້ຍັງບໍ່ຮັບຊຳລະ online ໃນ Phase 2.3
              </AlertDescription>
            </Alert>
            <Button asChild size="lg">
              <a href="/book">ກວດຫ້ອງວ່າງ</a>
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function FeatureItem({
  description,
  icon,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Item variant="outline">
      <ItemMedia variant="icon">{icon}</ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
    </Item>
  );
}

function SummaryTile({
  description,
  icon,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border bg-background p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="mt-1 text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

async function renderCheckoutPage(request: Request, client: DbClient) {
  const url = new URL(request.url);
  const holdId = url.searchParams.get("holdId") ?? "";
  const guests = Number(url.searchParams.get("guests") ?? "1");
  const hold = holdId ? await getBookingHoldStatus(holdId, client) : null;
  const expired = hold?.expired ?? true;

  if (hold && expired) {
    await releaseBookingHold(hold.id, client);
  }

  const backUrl =
    hold && !expired
      ? `/book?from=${encodeURIComponent(hold.checkInDate)}&to=${encodeURIComponent(hold.checkOutDate)}&guests=${guests}`
      : "/book";

  return renderDocument(client, {
    title: "ຢືນຢັນການຈອງ",
    description: "ກອກຂໍ້ມູນເພື່ອຢືນຢັນການຈອງຫ້ອງພັກ",
    noindex: true,
    children:
      !hold || expired ? (
        <Card>
          <CardHeader>
            <CardTitle>Hold ໝົດອາຍຸ ຫຼື ບໍ່ຖືກຕ້ອງ</CardTitle>
            <CardDescription>ກະລຸນາຄົ້ນຫາຫ້ອງວ່າງໃໝ່</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/book">ຄົ້ນຫາໃໝ່</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <Button asChild className="w-fit" variant="outline">
            <a href={backUrl} id="backToSearchLink">
              ← ກັບໄປຄົ້ນຫາ
            </a>
          </Button>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <Card className="overflow-hidden pt-0">
              <CardHeader className="border-b bg-muted/30 pt-4">
                <Badge className="w-fit" variant="secondary">
                  Checkout
                </Badge>
                <CardTitle className="text-3xl">ຢືນຢັນການຈອງ</CardTitle>
                <CardDescription>
                  ກອກຂໍ້ມູນຜູ້ຈອງ ເພື່ອຢືນຢັນ hold ແລະສ້າງ booking code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="checkoutForm">
                  <FieldGroup>
                    <input name="holdId" type="hidden" value={hold.id} />
                    <input name="guestsCount" type="hidden" value={guests} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <FieldLayout>
                        <FieldLabel htmlFor="guestName">ຊື່ຜູ້ຈອງ</FieldLabel>
                        <Input
                          id="guestName"
                          name="guestName"
                          placeholder="ຊື່ ແລະ ນາມສະກຸນ"
                          required
                        />
                      </FieldLayout>
                      <FieldLayout>
                        <FieldLabel htmlFor="phone">ເບີໂທ</FieldLabel>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="020..."
                          required
                        />
                      </FieldLayout>
                    </div>
                    <FieldLayout>
                      <FieldLabel htmlFor="email">ອີເມວ (optional)</FieldLabel>
                      <Input
                        id="email"
                        name="email"
                        placeholder="guest@example.com"
                        type="email"
                      />
                    </FieldLayout>
                    <FieldLayout>
                      <FieldLabel htmlFor="note">ໝາຍເຫດເພີ່ມເຕີມ</FieldLabel>
                      <Textarea
                        id="note"
                        name="note"
                        placeholder="ເຊັ່ນ: ມາຮອດຊ້າ, ຂໍຫ້ອງຊັ້ນສູງ..."
                        rows={4}
                      />
                    </FieldLayout>
                    <label className="hidden">
                      Website
                      <input autoComplete="off" name="website" tabIndex={-1} />
                    </label>
                    <Alert>
                      <ShieldCheck />
                      <AlertTitle>ຂໍ້ມູນຂອງທ່ານຈະຖືກສົ່ງໃຫ້ Reception</AlertTitle>
                      <AlertDescription>
                        ການຈອງນີ້ຈະປາກົດໃນ Front Desk ແລະ Calendar ທັນທີຫຼັງຢືນຢັນ
                      </AlertDescription>
                    </Alert>
                    <div className="flex flex-wrap gap-3">
                      <Button className="md:w-fit" size="lg" type="submit">
                        ຢືນຢັນຈອງ
                      </Button>
                      <Button
                        className="md:w-fit"
                        id="cancelBookingBtn"
                        size="lg"
                        type="button"
                        variant="outline"
                      >
                        ຍົກເລີກການຈອງ
                      </Button>
                    </div>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <Card className="border-primary/20 shadow-md">
                <CardHeader>
                  <CardTitle>ສະຫຼຸບການຈອງ</CardTitle>
                  <CardDescription>
                    Hold ເຖິງ {hold.expiresAt.toLocaleTimeString("lo-LA")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <ItemGroup className="gap-3">
                    <FeatureItem
                      description={`${hold.checkInDate} – ${hold.checkOutDate}`}
                      icon={<CalendarDays />}
                      title="ຊ່ວງວັນທີ"
                    />
                    <FeatureItem
                      description={`${guests} ຄົນ`}
                      icon={<Users />}
                      title="ຜູ້ເຂົ້າພັກ"
                    />
                    <FeatureItem
                      description="Reception ຈະຕິດຕໍ່ຢືນຢັນຕາມເບີໂທ"
                      icon={<Phone />}
                      title="ການຕິດຕໍ່"
                    />
                  </ItemGroup>
                  <Separator />
                  <div className="rounded-lg bg-muted p-4 text-muted-foreground text-sm">
                    ຫຼັງຢືນຢັນ ລະບົບຈະສ້າງລະຫັດຈອງ ແລະສົ່ງລາຍການໄປຫາ Front Desk.
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      ),
    script: `
      const holdId = ${JSON.stringify(hold?.id ?? "")};
      const backUrl = ${JSON.stringify(backUrl)};
      const expiresAt = ${hold && !expired ? hold.expiresAtMs : "null"};

      async function releaseHold() {
        if (!holdId) return;
        await fetch('/api/public/holds/' + encodeURIComponent(holdId), {
          method: 'DELETE',
        }).catch(() => null);
      }

      async function leaveCheckout(options) {
        if (options?.confirm && !window.confirm('ຕ້ອງການຍົກເລີກການຈອງນີ້ບໍ?')) {
          return;
        }
        await releaseHold();
        location.href = backUrl;
      }

      document.getElementById('backToSearchLink')?.addEventListener('click', async (event) => {
        event.preventDefault();
        await leaveCheckout();
      });

      document.getElementById('cancelBookingBtn')?.addEventListener('click', async () => {
        await leaveCheckout({ confirm: true });
      });

      function handleHoldExpired() {
        alert('Hold ໝົດອາຍຸແລ້ວ ກະລຸນາຄົ້ນຫາຫ້ອງວ່າງໃໝ່');
        location.href = '/book';
      }

      if (expiresAt) {
        const expiryTimer = setInterval(() => {
          if (Date.now() >= expiresAt) {
            clearInterval(expiryTimer);
            handleHoldExpired();
          }
        }, 1000);
      }

      document.getElementById('checkoutForm')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (expiresAt && Date.now() >= expiresAt) {
          handleHoldExpired();
          return;
        }
        const form = new FormData(event.currentTarget);
        const payload = Object.fromEntries(form.entries());
        payload.guestsCount = Number(payload.guestsCount || 1);
        const res = await fetch('/api/public/bookings/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.error === 'HOLD_EXPIRED') {
            handleHoldExpired();
            return;
          }
          alert('ຢືນຢັນການຈອງບໍ່ສຳເລັດ ກະລຸນາຄົ້ນຫາໃໝ່');
          return;
        }
        const data = await res.json();
        location.href = '/book/confirmation/' + encodeURIComponent(data.code);
      });
    `,
  });
}

async function renderConfirmationPage(request: Request, client: DbClient) {
  const code = decodeURIComponent(
    new URL(request.url).pathname.split("/").pop() ?? "",
  );
  try {
    const { booking } = await getPublicBookingService(client, { code });
    return renderDocument(client, {
      title: "ຈອງສຳເລັດ",
      description: "ຢືນຢັນການຈອງຫ້ອງພັກສຳເລັດ",
      noindex: true,
      children: (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <section className="overflow-hidden rounded-3xl border bg-card">
            <div className="bg-[radial-gradient(circle_at_top_left,var(--secondary)_0,transparent_38%),linear-gradient(135deg,var(--primary),var(--foreground))] px-6 py-12 text-center text-primary-foreground md:px-10">
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/25">
                <CheckCircle2 className="size-9" />
              </div>
              <Badge className="mb-4" variant="secondary">
                Booking Confirmed
              </Badge>
              <h1 className="text-balance font-bold text-4xl tracking-tight md:text-5xl">
                ຈອງສຳເລັດ
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-primary-foreground/80">
                ການຈອງຂອງທ່ານຖືກສ້າງແລ້ວ ແລະສົ່ງເຂົ້າ Front Desk ຂອງໂຮງແຮມແລ້ວ
              </p>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <Card className="overflow-hidden pt-0">
              <CardHeader className="border-b bg-muted/30 pt-4">
                <CardDescription>ລະຫັດການຈອງ</CardDescription>
                <CardTitle className="font-mono text-3xl tracking-wide">
                  {booking.code}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <SummaryTile
                  description={`${booking.checkInDate} – ${booking.checkOutDate}`}
                  icon={<CalendarDays />}
                  title="ຊ່ວງວັນທີ"
                />
                <SummaryTile
                  description={`${booking.roomTypeName ?? "ຫ້ອງພັກ"} · ຫ້ອງ ${booking.roomNumber}`}
                  icon={<BedDouble />}
                  title="ຫ້ອງພັກ"
                />
                <SummaryTile
                  description={`${booking.guestsCount} ຄົນ`}
                  icon={<Users />}
                  title="ຜູ້ເຂົ້າພັກ"
                />
                <SummaryTile
                  description="ຈ່າຍທີ່ໂຮງແຮມ"
                  icon={<ShieldCheck />}
                  title="ການຊຳລະ"
                />
              </CardContent>
            </Card>

            <aside className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>ຂັ້ນຕອນຕໍ່ໄປ</CardTitle>
                  <CardDescription>ກະລຸນາເກັບລະຫັດການຈອງນີ້ໄວ້</CardDescription>
                </CardHeader>
                <CardContent>
                  <ItemGroup className="gap-3">
                    <FeatureItem
                      description="ແຈ້ງລະຫັດນີ້ກັບ Reception ເມື່ອເຂົ້າພັກ"
                      icon={<CheckCircle2 />}
                      title="ເກັບລະຫັດຈອງ"
                    />
                    <FeatureItem
                      description="Reception ຈະກວດສອບການຈອງ ແລະຈັດການ check-in"
                      icon={<BedDouble />}
                      title="ເຂົ້າພັກທີ່ໂຮງແຮມ"
                    />
                  </ItemGroup>
                </CardContent>
              </Card>

              <Alert>
                <Phone />
                <AlertTitle>ຕ້ອງການແກ້ໄຂການຈອງ?</AlertTitle>
                <AlertDescription>
                  ກະລຸນາຕິດຕໍ່ໂຮງແຮມ ແລະແຈ້ງລະຫັດຈອງ {booking.code}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-2">
                <Button asChild size="lg">
                  <a href="/book">ຈອງຫ້ອງເພີ່ມ</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/book">ກັບໜ້າຫຼັກ</a>
                </Button>
              </div>
            </aside>
          </div>
        </div>
      ),
    });
  } catch {
    return renderDocument(client, {
      title: "ບໍ່ພົບການຈອງ",
      description: "ບໍ່ພົບລະຫັດການຈອງນີ້",
      noindex: true,
      children: (
        <Card>
          <CardHeader>
            <CardTitle>ບໍ່ພົບການຈອງ</CardTitle>
            <CardDescription>ກະລຸນາກວດລະຫັດການຈອງອີກຄັ້ງ</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/book">ກັບໄປຈອງຫ້ອງ</a>
            </Button>
          </CardContent>
        </Card>
      ),
    });
  }
}

export async function renderBookingPage(
  request: Request,
  client: DbClient = db,
) {
  if (process.env.PUBLIC_BOOKING_ENABLED === "false") {
    return new Response("Public booking is disabled", { status: 404 });
  }

  const pathname = new URL(request.url).pathname;
  let stream: ReadableStream<Uint8Array> | null;
  if (pathname === "/book") {
    stream = await renderBookPage(request, client);
  } else if (pathname.startsWith("/book/room-types/")) {
    stream = await renderRoomTypePage(request, client);
  } else if (pathname === "/book/checkout") {
    stream = await renderCheckoutPage(request, client);
  } else if (pathname.startsWith("/book/confirmation/")) {
    stream = await renderConfirmationPage(request, client);
  } else {
    stream = null;
  }

  if (!stream) return new Response("Not found", { status: 404 });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": pathname.includes("/confirmation/")
        ? "no-store"
        : "no-cache",
    },
  });
}
