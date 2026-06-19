import { Router } from "express";
import { getPublishedBlogs, getPublishedBlogById } from "../controllers/blog.controller.js";
import requireAuth from "../middlewares/requireAuth.js";

const router = Router();

router.get("/", requireAuth, getPublishedBlogs);
router.get("/:id", requireAuth, getPublishedBlogById);

export default router;
