import { z } from "zod";

export const createFlowerTypeSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  defaultDuration: z.number().int().positive().optional(),
});

export const updateFlowerTypeSchema = createFlowerTypeSchema.partial().strict();
