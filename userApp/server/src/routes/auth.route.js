import {Router} from "express";

import { 
  getProfile, 
  getSession,
  getActiveSessions,
  revokeSession,
  revokeOtherSessions
} from "../controllers/auth.controller.js";
import requireAuth from "../middlewares/requireAuth.js";
import validate from "../middlewares/validate.js";
import rateLimiter from "../middlewares/rateLimiter.js";
import { revokeSessionSchema } from "../schemas/auth.schema.js";

const router = Router();

router.use(rateLimiter);

router.get("/session", getSession);
router.get("/profile", requireAuth, getProfile);

router.get("/sessions", requireAuth, getActiveSessions);
router.post("/sessions/revoke", requireAuth, validate(revokeSessionSchema), revokeSession);
router.post("/sessions/revoke-others", requireAuth, revokeOtherSessions);

export default router;
