import { desc, eq, lt, or, and, ilike, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { docs } from "../db/schema.js";

const docSelect = {
  id: docs.id,
  title: docs.title,
  slug: docs.slug,
  content: docs.content,
  parentId: docs.parentId,
  orderIndex: docs.orderIndex,
  isPublished: docs.isPublished,
  createdAt: docs.createdAt,
  updatedAt: docs.updatedAt,
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

export const getPublishedDocs = async (req, res) => {
  const parentIdParam = req.query.parentId;
  const limit = Math.min(parseInt(req.query.limit || "50", 10), 100);
  const cursorParam = req.query.cursor;

  const decoded = cursorParam ? decodeCursor(cursorParam) : null;

  let condition = eq(docs.isPublished, true);

  const parentCondition = parentIdParam === "null"
    ? isNull(docs.parentId)
    : parentIdParam
      ? eq(docs.parentId, parentIdParam)
      : undefined;

  if (parentCondition) {
    condition = and(condition, parentCondition);
  }

  if (decoded) {
    const cursorCondition = or(
      lt(docs.createdAt, decoded.createdAt),
      and(
        eq(docs.createdAt, decoded.createdAt),
        lt(docs.id, decoded.id)
      )
    );
    condition = and(condition, cursorCondition);
  }

  const docItems = await db
    .select(docSelect)
    .from(docs)
    .where(condition)
    .orderBy(desc(docs.createdAt), desc(docs.id))
    .limit(limit + 1);

  const hasNextPage = docItems.length > limit;
  const results = hasNextPage ? docItems.slice(0, limit) : docItems;

  const lastItem = results[results.length - 1];
  const nextCursor =
    hasNextPage && lastItem
      ? encodeCursor(lastItem.createdAt, lastItem.id)
      : null;

  res.status(200).json({
    status: "success",
    data: {
      docs: results,
      nextCursor,
    },
  });
};

export const getPublishedDocBySlug = async (req, res) => {
  const slug = req.params.slug;

  const docItems = await db
    .select(docSelect)
    .from(docs)
    .where(and(eq(docs.slug, slug), eq(docs.isPublished, true)))
    .limit(1);

  const doc = docItems[0];

  if (!doc) {
    return res.status(404).json({
      status: "error",
      message: "Document not found or not published",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      doc,
    },
  });
};

export const searchPublishedDocs = async (req, res) => {
  const { q: search, limit = 20 } = req.query;

  const docResults = await db
    .select(docSelect)
    .from(docs)
    .where(
      and(
        eq(docs.isPublished, true),
        or(
          ilike(docs.title, `%${search}%`),
          ilike(docs.content, `%${search}%`),
          ilike(docs.slug, `%${search}%`)
        )
      )
    )
    .orderBy(desc(docs.createdAt), desc(docs.id))
    .limit(Math.min(parseInt(limit, 10), 100));

  res.status(200).json({
    status: "success",
    data: {
      docs: docResults,
    },
  });
};
