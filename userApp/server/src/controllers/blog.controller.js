import { desc, eq, lt, or, and, ilike } from "drizzle-orm";
import { db } from "../db/index.js";
import { blogs } from "../db/schema.js";

const blogSelect = {
  id: blogs.id,
  title: blogs.title,
  slug: blogs.slug,
  content: blogs.content,
  isPublished: blogs.isPublished,
  createdAt: blogs.createdAt,
  updatedAt: blogs.updatedAt,
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

export const getPublishedBlogs = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
  const cursorParam = req.query.cursor;

  const decoded = cursorParam ? decodeCursor(cursorParam) : null;

  let condition = eq(blogs.isPublished, true);
  if (decoded) {
    condition = and(
      eq(blogs.isPublished, true),
      or(
        lt(blogs.createdAt, decoded.createdAt),
        and(
          eq(blogs.createdAt, decoded.createdAt),
          lt(blogs.id, decoded.id)
        )
      )
    );
  }

  const blogItems = await db
    .select(blogSelect)
    .from(blogs)
    .where(condition)
    .orderBy(desc(blogs.createdAt), desc(blogs.id))
    .limit(limit + 1);

  const hasNextPage = blogItems.length > limit;
  const results = hasNextPage ? blogItems.slice(0, limit) : blogItems;

  const lastItem = results[results.length - 1];
  const nextCursor =
    hasNextPage && lastItem
      ? encodeCursor(lastItem.createdAt, lastItem.id)
      : null;

  res.status(200).json({
    status: "success",
    data: {
      blogs: results,
      nextCursor,
    },
  });
};

export const getPublishedBlogBySlug = async (req, res) => {
  const slug = req.params.slug;

  const blogItems = await db
    .select(blogSelect)
    .from(blogs)
    .where(and(eq(blogs.slug, slug), eq(blogs.isPublished, true)))
    .limit(1);

  const blog = blogItems[0];

  if (!blog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found or not published",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      blog,
    },
  });
};

export const searchPublishedBlogs = async (req, res) => {
  const { q: search, limit } = req.query;

  const blogResults = await db
    .select(blogSelect)
    .from(blogs)
    .where(
      and(
        eq(blogs.isPublished, true),
        or(
          ilike(blogs.title, `%${search}%`),
          ilike(blogs.content, `%${search}%`),
          ilike(blogs.slug, `%${search}%`)
        )
      )
    )
    .orderBy(desc(blogs.createdAt), desc(blogs.id))
    .limit(Math.min(limit, 100));

  res.status(200).json({
    status: "success",
    data: {
      blogs: blogResults,
    },
  });
};
