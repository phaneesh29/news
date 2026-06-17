CREATE TYPE "public"."news_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TABLE "dev_news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"source_url" varchar(512),
	"priority" "news_priority" DEFAULT 'low' NOT NULL,
	"author_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dev_news" ADD CONSTRAINT "dev_news_author_id_admin_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dev_news_priority_idx" ON "dev_news" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "dev_news_created_at_idx" ON "dev_news" USING btree ("created_at");