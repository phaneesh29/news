CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "dev_news" ADD COLUMN "content_embedding" vector(1024);