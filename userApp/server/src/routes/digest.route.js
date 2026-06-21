import { Router } from "express";
import { getDigest } from "../controllers/digest.controller.js";
import requireAuth from "../middlewares/requireAuth.js";

const router = Router();

router.get("/", requireAuth, getDigest);

export default router;
