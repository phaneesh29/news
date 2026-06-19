CREATE TABLE "news_likes" (
	"user_id" text NOT NULL,
	"news_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_likes_user_id_news_id_pk" PRIMARY KEY("user_id","news_id")
);
--> statement-breakpoint
ALTER TABLE "news_likes" ADD CONSTRAINT "news_likes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_likes" ADD CONSTRAINT "news_likes_news_id_dev_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."dev_news"("id") ON DELETE cascade ON UPDATE no action;