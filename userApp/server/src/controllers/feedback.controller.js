import { db } from "../db/index.js";
import { feedbacks } from "../db/schema.js";

export const submitFeedback = async (req, res) => {
  const userId = req.auth.user.id;
  const email = req.auth.user.email;
  const { category, message } = req.body;

  const [newFeedback] = await db
    .insert(feedbacks)
    .values({
      userId,
      email,
      category,
      message,
    })
    .returning();

  res.status(201).json({
    status: "success",
    message: "Feedback submitted successfully.",
    data: {
      feedback: newFeedback,
    },
  });
};
