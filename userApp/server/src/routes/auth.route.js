import {Router} from "express";

import { getProfile, getSession } from "../controllers/auth.controller.js";
import requireAuth from "../middlewares/requireAuth.js";

const router = Router();

router.get("/session", getSession);
router.get("/profile", requireAuth, getProfile);

export default router;
