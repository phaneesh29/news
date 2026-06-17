ALTER TABLE "dev_news" ADD COLUMN "title" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "dev_news" ADD COLUMN "tags" text[] DEFAULT '{}'::text[] NOT NULL;