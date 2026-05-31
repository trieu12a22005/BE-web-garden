import { z } from "zod";
import { CareTaskType, VerifyType, ResourceType } from "../../generated/prisma/index.js";

export const createCareTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.nativeEnum(CareTaskType),
  isDefault: z.boolean().optional(),
  rewardResource: z.nativeEnum(ResourceType).optional(),
  rewardAmount: z.number().int().min(1).optional(),
  growthReward: z.number().int().min(0).optional(),
  verifyType: z.nativeEnum(VerifyType).optional(),
  durationSeconds: z.number().int().min(1).optional(),
});

// Tất cả field đều optional khi PATCH
export const updateCareTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  rewardResource: z.nativeEnum(ResourceType).optional(),
  rewardAmount: z.number().int().min(1).optional(),
  growthReward: z.number().int().min(0).optional(),
  verifyType: z.nativeEnum(VerifyType).optional(),
  durationSeconds: z.number().int().min(1).optional(),
});

export const completeCareTaskSchema = z.object({
  careTaskId: z.string().uuid(),
  virtualPlantId: z.string().uuid().optional(),
});

export const answerCareTaskQuizSchema = z.object({
  careTaskId: z.string().uuid(),
  selectedOptionIndex: z.number().int().min(0),
  virtualPlantId: z.string().uuid().optional(),
});
