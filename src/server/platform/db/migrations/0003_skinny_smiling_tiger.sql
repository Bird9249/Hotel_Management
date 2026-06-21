CREATE TABLE "hk_room_task" (
	"id" text PRIMARY KEY NOT NULL,
	"shift_id" text,
	"room_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"completed_by_user_id" text
);
--> statement-breakpoint
CREATE TABLE "hk_shift" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"opened_by_user_id" text NOT NULL,
	"opened_at" timestamp DEFAULT now() NOT NULL,
	"closed_by_user_id" text,
	"closed_at" timestamp,
	"rooms_completed" integer,
	"rooms_pending" integer,
	"handover_note" text
);
--> statement-breakpoint
ALTER TABLE "hk_room_task" ADD CONSTRAINT "hk_room_task_shift_id_hk_shift_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."hk_shift"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hk_room_task" ADD CONSTRAINT "hk_room_task_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hk_room_task" ADD CONSTRAINT "hk_room_task_completed_by_user_id_user_id_fk" FOREIGN KEY ("completed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hk_shift" ADD CONSTRAINT "hk_shift_opened_by_user_id_user_id_fk" FOREIGN KEY ("opened_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hk_shift" ADD CONSTRAINT "hk_shift_closed_by_user_id_user_id_fk" FOREIGN KEY ("closed_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hk_room_task_shift_room_unique" ON "hk_room_task" USING btree ("shift_id","room_id");
--> statement-breakpoint
UPDATE "rbac_role"
SET "permissions" = ARRAY(SELECT DISTINCT unnest("permissions" || ARRAY['housekeeping:read','housekeeping:shift','housekeeping:task']::varchar[]))
WHERE "id" = 'admin';
--> statement-breakpoint
UPDATE "rbac_role"
SET "permissions" = ARRAY(SELECT DISTINCT unnest("permissions" || ARRAY['housekeeping:read']::varchar[]))
WHERE "id" = 'receptionist';
--> statement-breakpoint
UPDATE "rbac_role"
SET "permissions" = ARRAY(SELECT DISTINCT unnest("permissions" || ARRAY['rooms:read','rooms:status','housekeeping:read','housekeeping:shift','housekeeping:task']::varchar[]))
WHERE "id" = 'housekeeping';