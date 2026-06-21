CREATE TABLE "channel_room_mapping" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"room_type_id" text NOT NULL,
	"external_room_type_id" text NOT NULL,
	"allotment" integer
);
--> statement-breakpoint
CREATE TABLE "channel_sync_log" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"direction" text NOT NULL,
	"operation" text NOT NULL,
	"status" text NOT NULL,
	"request_summary" jsonb,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_hold" (
	"id" text PRIMARY KEY NOT NULL,
	"room_type_id" text NOT NULL,
	"check_in_date" date NOT NULL,
	"check_out_date" date NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"source" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_channel" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"config" jsonb,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sales_channel_code_unique" UNIQUE("code")
);
--> statement-breakpoint
INSERT INTO "sales_channel" ("id", "code", "name", "is_active", "config", "created_at") VALUES
	('channel_direct_web', 'direct_web', 'Direct Booking', true, '{}'::jsonb, now()),
	('channel_agoda', 'agoda', 'Agoda', false, '{}'::jsonb, now()),
	('channel_booking_com', 'booking_com', 'Booking.com', false, '{}'::jsonb, now()),
	('channel_expedia', 'expedia', 'Expedia', false, '{}'::jsonb, now())
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "source" text DEFAULT 'front_desk' NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "channel_id" text;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "external_booking_id" text;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "external_payload" jsonb;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "notes" text;--> statement-breakpoint
UPDATE "reservation"
SET "source" = 'direct_web',
	"channel_id" = 'channel_direct_web',
	"external_booking_id" = 'demo-direct-101-upcoming'
WHERE "id" = 'demo-res-101-upcoming';--> statement-breakpoint
UPDATE "reservation"
SET "source" = 'front_desk',
	"channel_id" = NULL,
	"external_booking_id" = NULL
WHERE "id" = 'demo-res-102-stay';--> statement-breakpoint
UPDATE "reservation"
SET "source" = 'agoda',
	"channel_id" = 'channel_agoda',
	"external_booking_id" = 'demo-agoda-103-booked'
WHERE "id" = 'demo-res-103-booked';--> statement-breakpoint
UPDATE "reservation"
SET "source" = 'booking_com',
	"channel_id" = 'channel_booking_com',
	"external_booking_id" = 'demo-booking-201-booked'
WHERE "id" = 'demo-res-201-booked';--> statement-breakpoint
UPDATE "reservation"
SET "source" = 'direct_web',
	"channel_id" = 'channel_direct_web',
	"external_booking_id" = 'demo-direct-202-suite'
WHERE "id" = 'demo-res-202-suite';--> statement-breakpoint
UPDATE "reservation"
SET "source" = 'expedia',
	"channel_id" = 'channel_expedia',
	"external_booking_id" = 'demo-expedia-cancelled'
WHERE "id" = 'demo-res-cancelled';--> statement-breakpoint
UPDATE "reservation"
SET "source" = 'front_desk',
	"channel_id" = NULL,
	"external_booking_id" = NULL
WHERE "id" = 'demo-res-done';--> statement-breakpoint
UPDATE "reservation"
SET "source" = 'direct_web',
	"channel_id" = 'channel_direct_web',
	"external_booking_id" = 'demo-direct-done-2'
WHERE "id" = 'demo-res-done-2';--> statement-breakpoint
ALTER TABLE "channel_room_mapping" ADD CONSTRAINT "channel_room_mapping_channel_id_sales_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."sales_channel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_room_mapping" ADD CONSTRAINT "channel_room_mapping_room_type_id_room_type_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_type"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_sync_log" ADD CONSTRAINT "channel_sync_log_channel_id_sales_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."sales_channel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_hold" ADD CONSTRAINT "inventory_hold_room_type_id_room_type_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "channel_room_mapping_channel_room_type_unique" ON "channel_room_mapping" USING btree ("channel_id","room_type_id");--> statement-breakpoint
INSERT INTO "channel_room_mapping" ("id", "channel_id", "room_type_id", "external_room_type_id", "allotment") VALUES
	('demo-mapping-direct-standard', 'channel_direct_web', 'demo-room-type-standard', 'direct-standard', NULL),
	('demo-mapping-direct-deluxe', 'channel_direct_web', 'demo-room-type-deluxe', 'direct-deluxe', NULL),
	('demo-mapping-direct-suite', 'channel_direct_web', 'demo-room-type-suite', 'direct-suite', NULL),
	('demo-mapping-agoda-deluxe', 'channel_agoda', 'demo-room-type-deluxe', 'AGD-DLX-001', 1),
	('demo-mapping-booking-standard', 'channel_booking_com', 'demo-room-type-standard', 'BDC-STD-001', 1)
ON CONFLICT ("channel_id", "room_type_id") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_channel_id_sales_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."sales_channel"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "reservation_channel_external_booking_unique" ON "reservation" USING btree ("channel_id","external_booking_id") WHERE "reservation"."external_booking_id" is not null;--> statement-breakpoint
UPDATE "rbac_role"
SET "permissions" = array(
	SELECT DISTINCT unnest("permissions" || ARRAY['channels:read', 'channels:manage', 'channels:sync'])
)
WHERE "id" = 'admin';--> statement-breakpoint
UPDATE "rbac_role"
SET "permissions" = array(
	SELECT DISTINCT unnest("permissions" || ARRAY['channels:read'])
)
WHERE "id" = 'receptionist';