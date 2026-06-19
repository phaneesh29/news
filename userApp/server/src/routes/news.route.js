import { Router } from "express";
import { getPublishedNews, getPublishedNewsById, likeNews, unlikeNews, getMyLikedNews } from "../controllers/news.controller.js";
import requireAuth from "../middlewares/requireAuth.js";
import validate from "../middlewares/validate.js";
import { idParamSchema } from "../schemas/common.schema.js";

const router = Router();

router.get("/", requireAuth, getPublishedNews);
router.get("/liked", requireAuth, getMyLikedNews);
router.get("/:id", requireAuth, validate(idParamSchema, "params"), getPublishedNewsById);
router.post("/:id/like", requireAuth, validate(idParamSchema, "params"), likeNews);
router.delete("/:id/like", requireAuth, validate(idParamSchema, "params"), unlikeNews);

export default router;
