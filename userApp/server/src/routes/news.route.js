import { Router } from "express";
import { getPublishedNews, getPublishedNewsById } from "../controllers/news.controller.js";
import requireAuth from "../middlewares/requireAuth.js";

const router = Router();

router.get("/", requireAuth, getPublishedNews);
router.get("/:id", requireAuth, getPublishedNewsById);

export default router;
