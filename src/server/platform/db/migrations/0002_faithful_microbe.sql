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
