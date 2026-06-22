CREATE TABLE "api_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "api_rate_limits_reset_at_idx" ON "api_rate_limits" USING btree ("reset_at");