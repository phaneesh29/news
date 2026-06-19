import { Router } from "express";
import { getPublishedBlogs, getPublishedBlogById } from "../controllers/blog.controller.js";

const router = Router();

router.get("/", getPublishedBlogs);
router.get("/:id", getPublishedBlogById);

export default router;
