import { z } from "zod";

const PLANT_STATUS = ["SEED", "SPROUT", "GROWING", "BUDDING", "BLOOMING", "RESTING"] as const;

const stageImagesSchema = z
  .record(z.enum(PLANT_STATUS), z.string().url())
  .nullish();

export const createFlowerTypeSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  imageUrl: z.string().url().nullish(),
  defaultDuration: z.number().int().positive().nullish(),
  stageImages: stageImagesSchema,
});

export const updateFlowerTypeSchema = createFlowerTypeSchema.partial().strict();
