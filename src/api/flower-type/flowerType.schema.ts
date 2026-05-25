import { z } from "zod";

export const createFlowerTypeSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  imageUrl: z.string().url().nullish(),
  defaultDuration: z.number().int().positive().nullish(),
});

export const updateFlowerTypeSchema = createFlowerTypeSchema.partial().strict();
