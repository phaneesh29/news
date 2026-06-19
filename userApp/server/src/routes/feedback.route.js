import { Router } from "express";
import { submitFeedback } from "../controllers/feedback.controller.js";
import requireAuth from "../middlewares/requireAuth.js";
import validate from "../middlewares/validate.js";
import { createFeedbackSchema } from "../schemas/feedback.schema.js";

const router = Router();

router.use(requireAuth);

router.post("/", validate(createFeedbackSchema, "body"), submitFeedback);

export default router;
