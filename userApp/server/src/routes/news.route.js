import { Router } from "express";
import { getPublishedNews, getPublishedNewsById } from "../controllers/news.controller.js";

const router = Router();

router.get("/", getPublishedNews);
router.get("/:id", getPublishedNewsById);

export default router;
