import { desc, eq, lt, or, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { devNews } from "../db/schema.js";

const newsSelect = {
  id: devNews.id,
  title: devNews.title,
  content: devNews.content,
  sourceUrl: devNews.sourceUrl,
  priority: devNews.priority,
  tags: devNews.tags,
  isPublished: devNews.isPublished,
  createdAt: devNews.createdAt,
  updatedAt: devNews.updatedAt,
};

const encodeCursor = (createdAt, id) => {
  const data = JSON.stringify({ createdAt: createdAt.toISOString(), id });
  return Buffer.from(data).toString("base64");
};

const decodeCursor = (cursorStr) => {
  try {
    const data = JSON.parse(Buffer.from(cursorStr, "base64").toString("utf-8"));
    return {
      createdAt: new Date(data.createdAt),
      id: data.id,
    };
  } catch {
    return null;
  }
};

export const getPublishedNews = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const cursorParam = req.query.cursor;

    const decoded = cursorParam ? decodeCursor(cursorParam) : null;

    let condition = eq(devNews.isPublished, true);
    if (decoded) {
      condition = and(
        eq(devNews.isPublished, true),
        or(
          lt(devNews.createdAt, decoded.createdAt),
          and(
            eq(devNews.createdAt, decoded.createdAt),
            lt(devNews.id, decoded.id)
          )
        )
      );
    }

    const newsItems = await db
      .select(newsSelect)
      .from(devNews)
      .where(condition)
      .orderBy(desc(devNews.createdAt), desc(devNews.id))
      .limit(limit + 1);

    const hasNextPage = newsItems.length > limit;
    const results = hasNextPage ? newsItems.slice(0, limit) : newsItems;

    const lastItem = results[results.length - 1];
    const nextCursor =
      hasNextPage && lastItem
        ? encodeCursor(lastItem.createdAt, lastItem.id)
        : null;

    res.status(200).json({
      status: "success",
      data: {
        news: results,
        nextCursor,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublishedNewsById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const newsItems = await db
      .select(newsSelect)
      .from(devNews)
      .where(and(eq(devNews.id, id), eq(devNews.isPublished, true)))
      .limit(1);

    const news = newsItems[0];

    if (!news) {
      return res.status(404).json({
        status: "error",
        message: "News not found or not published",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        news,
      },
    });
  } catch (error) {
    next(error);
  }
};
