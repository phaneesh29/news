import { Router } from "express";
import { getPublishedDocs, getPublishedDocBySlug, searchPublishedDocs } from "../controllers/doc.controller.js";
import requireAuth from "../middlewares/requireAuth.js";
import validate from "../middlewares/validate.js";
import { blogSearchSchema } from "../schemas/common.schema.js";

const router = Router();

router.get("/", requireAuth, getPublishedDocs);
router.get("/search", requireAuth, validate(blogSearchSchema, "query"), searchPublishedDocs);
router.get("/:slug", requireAuth, getPublishedDocBySlug);

export default router;
