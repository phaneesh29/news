import { Router } from "express";
import { getPublishedBlogs, getPublishedBlogById } from "../controllers/blog.controller.js";
import requireAuth from "../middlewares/requireAuth.js";
import validate from "../middlewares/validate.js";
import { idParamSchema } from "../schemas/common.schema.js";

const router = Router();

router.get("/", requireAuth, getPublishedBlogs);
router.get("/:id", requireAuth, validate(idParamSchema, "params"), getPublishedBlogById);

export default router;
