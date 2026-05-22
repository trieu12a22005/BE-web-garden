import { z } from "zod";
import { CareTaskType } from "../../generated/prisma/index.js";

export const createCareTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.nativeEnum(CareTaskType),
  isDefault: z.boolean().optional(),
});

export const completeCareTaskSchema = z.object({
  careTaskId: z.string().uuid(),
  virtualPlantId: z.string().uuid().optional(),
});
