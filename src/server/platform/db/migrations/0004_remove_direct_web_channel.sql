UPDATE "reservation"
SET "channel_id" = NULL
WHERE "source" = 'direct_web'
	OR "channel_id" = 'channel_direct_web';
--> statement-breakpoint
DELETE FROM "sales_channel"
WHERE "code" = 'direct_web';
