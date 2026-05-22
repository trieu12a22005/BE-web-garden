import { z } from "zod";
import { MoodLevel } from "../../generated/prisma/index.js";

export const createMoodJournalSchema = z.object({
  mood: z.nativeEnum(MoodLevel),
  note: z.string().optional(),
});
