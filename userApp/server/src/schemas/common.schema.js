import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format. Must be a valid UUID."),
});

export const blogSearchSchema = z.object({
  q: z.string().optional().default(""),
  limit: z.coerce.number().int().positive("Limit must be a positive integer.").optional().default(20),
});

export const newsSearchSchema = z.object({
  q: z.string().optional().default(""),
  priority: z.enum(["low", "medium", "high", "critical"], {
    errorMap: () => ({ message: "Priority must be one of: low, medium, high, critical." }),
  }).optional(),
  limit: z.coerce.number().int().positive("Limit must be a positive integer.").optional().default(20),
});
