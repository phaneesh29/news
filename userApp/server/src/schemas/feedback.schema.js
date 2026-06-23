import { z } from "zod";

export const createFeedbackSchema = z.object({
  category: z.enum(["feature", "improvement", "bug", "other"]).optional().default("other"),
  message: z
    .string({
      required_error: "Feedback message is required.",
    })
    .trim()
    .min(1, "Feedback message cannot be empty.")
    .max(5000, "Feedback message cannot exceed 5000 characters."),
});
