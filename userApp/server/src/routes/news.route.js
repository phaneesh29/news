import { Router } from "express";
import { getPublishedNews, getPublishedNewsById, likeNews, unlikeNews } from "../controllers/news.controller.js";
import requireAuth from "../middlewares/requireAuth.js";

const router = Router();

router.get("/", requireAuth, getPublishedNews);
router.get("/:id", requireAuth, getPublishedNewsById);
router.post("/:id/like", requireAuth, likeNews);
router.delete("/:id/like", requireAuth, unlikeNews);

export default router;
