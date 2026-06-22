import { Router } from "express";
import { getPublishedBlogs, getPublishedBlogById, searchPublishedBlogs } from "../controllers/blog.controller.js";
import requireAuth from "../middlewares/requireAuth.js";
import validate from "../middlewares/validate.js";
import { idParamSchema, blogSearchSchema } from "../schemas/common.schema.js";

const router = Router();

router.get("/", requireAuth, getPublishedBlogs);
router.get("/search", requireAuth, validate(blogSearchSchema, "query"), searchPublishedBlogs);
router.get("/:id", requireAuth, validate(idParamSchema, "params"), getPublishedBlogById);

export default router;
