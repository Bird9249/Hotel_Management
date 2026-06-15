CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"request_id" text,
	"trace_id" text,
	"tenant_id" text,
	"actor_id" text,
	"actor_role" text,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"result" text DEFAULT 'success',
	"error" text,
	"ip" text,
	"user_agent" text,
	"path" text,
	"method" text,
	"before" jsonb,
	"after" jsonb,
	"meta" jsonb,
	"prev_hash" text,
	"hash" text
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"phone_number" text,
	"phone_number_verified" boolean,
	"image" text,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" date,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cash_shift" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"opened_by_user_id" text NOT NULL,
	"opened_at" timestamp DEFAULT now() NOT NULL,
	"opening_cash" numeric(12, 2) NOT NULL,
	"closed_by_user_id" text,
	"closed_at" timestamp,
	"closing_cash_counted" numeric(12, 2),
	"cash_received" numeric(12, 2),
	"transfer_received" numeric(12, 2),
	"card_received" numeric(12, 2),
	"expected_cash" numeric(12, 2),
	"variance" numeric(12, 2),
	"handover_note" text
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" text PRIMARY KEY NOT NULL,
	"reservation_id" text NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0' NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'unpaid' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_item" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"description" text NOT NULL,
	"qty" numeric(12, 2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"amount" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"method" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	"shift_id" text,
	"recorded_by_user_id" text
);
--> statement-breakpoint
CREATE TABLE "guest" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"id_document" text,
	"nationality" text
);
--> statement-breakpoint
CREATE TABLE "hotel_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"name_en" text,
	"address" text,
	"phone" text,
	"tax_id" text,
	"logo_key" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" text NOT NULL,
	"aggregate_id" text NOT NULL,
	"message_type" text NOT NULL,
	"segment" text,
	"concurrency" text DEFAULT 'sequential' NOT NULL,
	"payload" jsonb NOT NULL,
	"metadata" jsonb,
	"locked_until" timestamp with time zone DEFAULT to_timestamp(0) NOT NULL,
	"created_at" timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
	"processed_at" timestamp with time zone,
	"abandoned_at" timestamp with time zone,
	"started_attempts" smallint DEFAULT 0 NOT NULL,
	"finished_attempts" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rbac_role" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"permissions" varchar[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rbac_user_role" (
	"user_id" text NOT NULL,
	"role_id" text NOT NULL,
	CONSTRAINT "rbac_user_role_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "reservation" (
	"id" text PRIMARY KEY NOT NULL,
	"guest_id" text NOT NULL,
	"room_id" text NOT NULL,
	"check_in_date" date NOT NULL,
	"check_out_date" date NOT NULL,
	"guests_count" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'booked' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room" (
	"id" text PRIMARY KEY NOT NULL,
	"room_number" text NOT NULL,
	"floor" integer,
	"room_type_id" text NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	CONSTRAINT "room_room_number_unique" UNIQUE("room_number")
);
--> statement-breakpoint
CREATE TABLE "room_type" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"base_price" numeric(12, 2) NOT NULL,
	"capacity" integer DEFAULT 2 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_shift" ADD CONSTRAINT "cash_shift_opened_by_user_id_user_id_fk" FOREIGN KEY ("opened_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_shift" ADD CONSTRAINT "cash_shift_closed_by_user_id_user_id_fk" FOREIGN KEY ("closed_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_reservation_id_reservation_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservation"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_shift_id_cash_shift_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."cash_shift"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_recorded_by_user_id_user_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rbac_user_role" ADD CONSTRAINT "rbac_user_role_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rbac_user_role" ADD CONSTRAINT "rbac_user_role_role_id_rbac_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."rbac_role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_guest_id_guest_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guest"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_room_type_id_room_type_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_type"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_by_time" ON "audit_logs" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "audit_logs_by_tenant_time" ON "audit_logs" USING btree ("tenant_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_logs_by_entity" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_by_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "outbox_aggregate_type_aggregate_id" ON "outbox" USING btree ("aggregate_type","aggregate_id");--> statement-breakpoint
CREATE INDEX "outbox_created_at" ON "outbox" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "outbox_processed_at" ON "outbox" USING btree ("processed_at");--> statement-breakpoint
CREATE INDEX "outbox_locked_until" ON "outbox" USING btree ("locked_until");


-- Seed RBAC roles (permissions from src/modules/roles/domain/contracts/permissions.ts)
-- ອອກແບບ role (src/modules/roles/domain/contracts/roles.ts):
--   admin         : ເຂົ້າເຖິງໄດ້ທຸກສ່ວນ
--   receptionist  : ຈອງ / ເຊັກອິນ-ເອົາທ໌ / ໃບບິນ / ກະເງິນສົດ / ລາຍງານ
--   housekeeping  : ເບິ່ງຫ້ອງ + ອັບເດດສະຖານະທຳຄວາມສະອາດ
INSERT INTO rbac_role (id, name, description, permissions) VALUES
-- admin: ທຸກ permission
('admin', 'ຜູ້ດູແລລະບົບ', 'ເຂົ້າເຖິງໄດ້ທຸກສ່ວນຂອງລະບົບ', ARRAY[
  'users:create', 'users:read', 'users:update', 'users:delete', 'users:ban',
  'audit:read',
  'rooms:read', 'rooms:create', 'rooms:update', 'rooms:delete', 'rooms:status',
  'guests:read', 'guests:create', 'guests:update', 'guests:delete',
  'reservations:read', 'reservations:create', 'reservations:update', 'reservations:cancel',
  'reservations:checkin', 'reservations:checkout',
  'billing:read', 'billing:invoice', 'billing:payment', 'billing:shift',
  'reports:read'
]),
-- receptionist: ງານຫນ້າຮັບ + ການເງິນ + ລາຍງານ (ບໍ່ຈັດການ user/audit)
('receptionist', 'ພ/ງ.ຕ້ອນຮັບ', 'ຈອງ ເຊັກອິນ/ເຊັກເອົາທ໌ ອອກໃບບິນ ຮັບຊຳລະ ແລະ ກະເງິນສົດ', ARRAY[
  'rooms:read', 'rooms:status',
  'guests:read', 'guests:create', 'guests:update', 'guests:delete',
  'reservations:read', 'reservations:create', 'reservations:update', 'reservations:cancel',
  'reservations:checkin', 'reservations:checkout',
  'billing:read', 'billing:invoice', 'billing:payment', 'billing:shift',
  'reports:read'
]),
-- housekeeping: ເບິ່ງຫ້ອງ + ປ່ຽນສະຖານະທຳຄວາມສະອາດ
('housekeeping', 'ແມ່ບ້ານ', 'ອັບເດດສະຖານະຫ້ອງ (ທຳຄວາມສະອາດ / ພ້ອມໃຊ້)', ARRAY[
  'rooms:read', 'rooms:status'
]);

-- Seed ຜູ້ໃຊ້ເລີ່ມຕົ້ນ (ລະຫັດຜ່ານທຸກບັນຊີ: 123456)
INSERT INTO "user" (
  id, name, email, email_verified, phone_number, phone_number_verified,
  role, banned, created_at, updated_at
) VALUES
(
  'admin_default', 'ຜູ້ດູແລລະບົບ', 'admin@hotel.com', true, NULL, false,
  'admin', false, NOW(), NOW()
),
(
  'receptionist_default', 'ພ/ງ.ຕ້ອນຮັບ', 'receptionist@hotel.com', true, NULL, false,
  'receptionist', false, NOW(), NOW()
),
(
  'housekeeping_default', 'ແມ່ບ້ານ', 'housekeeping@hotel.com', true, NULL, false,
  'housekeeping', false, NOW(), NOW()
);

-- ບັນຊີ credential (argon2id hash ສຳລັບ '123456')
INSERT INTO account (
  id, account_id, provider_id, user_id, password, created_at, updated_at
) VALUES
(
  'admin_account_001', 'admin_default', 'credential', 'admin_default',
  '$argon2id$v=19$m=65536,t=2,p=1$GOEgai7wS9gkZhUWXitA9CVKblhbXbXlk0ju457asrA$ZN/6RUVLTYgpNJuw9FAZ7cBDAAIVdkRcbAiAnc8iPCY',
  NOW(), NOW()
),
(
  'receptionist_account_001', 'receptionist_default', 'credential', 'receptionist_default',
  '$argon2id$v=19$m=65536,t=2,p=1$GOEgai7wS9gkZhUWXitA9CVKblhbXbXlk0ju457asrA$ZN/6RUVLTYgpNJuw9FAZ7cBDAAIVdkRcbAiAnc8iPCY',
  NOW(), NOW()
),
(
  'housekeeping_account_001', 'housekeeping_default', 'credential', 'housekeeping_default',
  '$argon2id$v=19$m=65536,t=2,p=1$GOEgai7wS9gkZhUWXitA9CVKblhbXbXlk0ju457asrA$ZN/6RUVLTYgpNJuw9FAZ7cBDAAIVdkRcbAiAnc8iPCY',
  NOW(), NOW()
);

-- ຜູກບົດບາດ RBAC
INSERT INTO rbac_user_role (user_id, role_id) VALUES
  ('admin_default', 'admin'),
  ('receptionist_default', 'receptionist'),
  ('housekeeping_default', 'housekeeping')
ON CONFLICT (user_id, role_id) DO NOTHING;
