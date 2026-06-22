import { desc, eq, lt, or, and, inArray, sql, ilike } from "drizzle-orm";
import { db } from "../db/index.js";
import { devNews, newsLikes } from "../db/schema.js";

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

export const getPublishedNews = async (req, res) => {
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

  let finalResults = results.map(item => ({
    ...item,
    likesCount: 0,
    hasLiked: false
  }));

  if (results.length > 0) {
    const newsIds = results.map(item => item.id);
    
    const likeCounts = await db
      .select({
        newsId: newsLikes.newsId,
        count: sql`count(*)`.mapWith(Number)
      })
      .from(newsLikes)
      .where(inArray(newsLikes.newsId, newsIds))
      .groupBy(newsLikes.newsId);

    const countsMap = {};
    likeCounts.forEach(c => {
      countsMap[c.newsId] = c.count;
    });

    let userLikesSet = new Set();
    if (req.auth?.user?.id) {
      const userLikes = await db
        .select({ newsId: newsLikes.newsId })
        .from(newsLikes)
        .where(
          and(
            inArray(newsLikes.newsId, newsIds),
            eq(newsLikes.userId, req.auth.user.id)
          )
        );
      userLikesSet = new Set(userLikes.map(l => l.newsId));
    }

    finalResults = results.map(item => ({
      ...item,
      likesCount: countsMap[item.id] || 0,
      hasLiked: userLikesSet.has(item.id)
    }));
  }

  const lastItem = results[results.length - 1];
  const nextCursor =
    hasNextPage && lastItem
      ? encodeCursor(lastItem.createdAt, lastItem.id)
      : null;

  res.status(200).json({
    status: "success",
    data: {
      news: finalResults,
      nextCursor,
    },
  });
};

export const getPublishedNewsById = async (req, res) => {
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

  const [likeCountResult] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(newsLikes)
    .where(eq(newsLikes.newsId, id));

  let hasLiked = false;
  if (req.auth?.user?.id) {
    const [userLikeResult] = await db
      .select({ newsId: newsLikes.newsId })
      .from(newsLikes)
      .where(and(eq(newsLikes.newsId, id), eq(newsLikes.userId, req.auth.user.id)));
    hasLiked = !!userLikeResult;
  }

  const newsWithLikes = {
    ...news,
    likesCount: likeCountResult?.count || 0,
    hasLiked
  };

  res.status(200).json({
    status: "success",
    data: {
      news: newsWithLikes,
    },
  });
};

export const likeNews = async (req, res) => {
  const newsId = req.params.id;
  const userId = req.auth.user.id;

  const newsItems = await db
    .select({ id: devNews.id })
    .from(devNews)
    .where(and(eq(devNews.id, newsId), eq(devNews.isPublished, true)))
    .limit(1);

  if (newsItems.length === 0) {
    return res.status(404).json({
      status: "error",
      message: "News article not found.",
    });
  }

  await db
    .insert(newsLikes)
    .values({ userId, newsId })
    .onConflictDoNothing();

  res.status(200).json({
    status: "success",
    message: "News article liked successfully.",
  });
};

export const unlikeNews = async (req, res) => {
  const newsId = req.params.id;
  const userId = req.auth.user.id;

  await db
    .delete(newsLikes)
    .where(and(eq(newsLikes.newsId, newsId), eq(newsLikes.userId, userId)));

  res.status(200).json({
    status: "success",
    message: "News article unliked successfully.",
  });
};

export const getMyLikedNews = async (req, res) => {
  const userId = req.auth.user.id;

  const likedNewsItems = await db
    .select({
      id: devNews.id,
      title: devNews.title,
      content: devNews.content,
      sourceUrl: devNews.sourceUrl,
      priority: devNews.priority,
      tags: devNews.tags,
      isPublished: devNews.isPublished,
      createdAt: devNews.createdAt,
      updatedAt: devNews.updatedAt,
      likesCount: sql`(SELECT count(*) FROM ${newsLikes} WHERE ${newsLikes.newsId} = ${devNews.id})`.mapWith(Number),
      hasLiked: sql`true`.mapWith(Boolean)
    })
    .from(devNews)
    .innerJoin(newsLikes, eq(newsLikes.newsId, devNews.id))
    .where(
      and(
        eq(newsLikes.userId, userId),
        eq(devNews.isPublished, true)
      )
    )
    .orderBy(desc(newsLikes.createdAt));

  res.status(200).json({
    status: "success",
    data: {
      news: likedNewsItems,
    },
  });
};

export const searchPublishedNews = async (req, res) => {
  const { q: search, priority, limit } = req.query;

  let conditions = [
    eq(devNews.isPublished, true),
    or(
      ilike(devNews.title, `%${search}%`),
      ilike(devNews.content, `%${search}%`),
      ilike(devNews.sourceUrl, `%${search}%`)
    )
  ];

  if (priority) {
    conditions.push(eq(devNews.priority, priority));
  }

  const newsItems = await db
    .select(newsSelect)
    .from(devNews)
    .where(and(...conditions))
    .orderBy(desc(devNews.createdAt), desc(devNews.id))
    .limit(Math.min(limit, 100));

  let finalResults = newsItems.map(item => ({
    ...item,
    likesCount: 0,
    hasLiked: false
  }));

  if (newsItems.length > 0) {
    const newsIds = newsItems.map(item => item.id);
    
    const likeCounts = await db
      .select({
        newsId: newsLikes.newsId,
        count: sql`count(*)`.mapWith(Number)
      })
      .from(newsLikes)
      .where(inArray(newsLikes.newsId, newsIds))
      .groupBy(newsLikes.newsId);

    const countsMap = {};
    likeCounts.forEach(c => {
      countsMap[c.newsId] = c.count;
    });

    let userLikesSet = new Set();
    if (req.auth?.user?.id) {
      const userLikes = await db
        .select({ newsId: newsLikes.newsId })
        .from(newsLikes)
        .where(
          and(
            inArray(newsLikes.newsId, newsIds),
            eq(newsLikes.userId, req.auth.user.id)
          )
        );
      userLikesSet = new Set(userLikes.map(l => l.newsId));
    }

    finalResults = newsItems.map(item => ({
      ...item,
      likesCount: countsMap[item.id] || 0,
      hasLiked: userLikesSet.has(item.id)
    }));
  }

  res.status(200).json({
    status: "success",
    data: {
      news: finalResults,
    },
  });
};
