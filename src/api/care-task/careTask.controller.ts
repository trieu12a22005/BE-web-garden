import type { Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma.js";
import type { CareTask } from "../../generated/prisma/index.js";

const RESOURCE_TYPES = ["WATER", "SUNLIGHT", "FERTILIZER", "AIR", "LOVE", "DEW"];
const DAILY_LIMIT = 10;
const QUIZ_OPTIONS = [
  "Ưu tiên an toàn, minh bạch và làm đúng quy trình.",
  "Bỏ qua bước kiểm tra để hoàn thành nhanh hơn.",
  "Chờ người khác xử lý thay cho mình.",
];

function seededRandom(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function todaySeed(): number {
  const d = new Date();
  return parseInt(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`);
}

function hashString(value: string): number {
  return value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function buildQuiz(task: CareTask) {
  const correctOptionIndex = hashString(task.id) % QUIZ_OPTIONS.length;
  const options = [...QUIZ_OPTIONS];
  const correctOption = options[0]!;
  options[0] = options[correctOptionIndex]!;
  options[correctOptionIndex] = correctOption;

  return {
    quizQuestion: `Trong tình huống "${task.title}", bạn nên chọn cách xử lý nào?`,
    quizOptions: options,
    correctOptionIndex,
  };
}

function toPublicQuiz(task: CareTask) {
  const quiz = buildQuiz(task);
  return {
    ...task,
    quizQuestion: quiz.quizQuestion,
    quizOptions: quiz.quizOptions,
  };
}

function selectDailyTasks(allTasks: CareTask[]): CareTask[] {
  const rand = seededRandom(todaySeed());

  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const temp = a[i];
      a[i] = a[j] as T;
      a[j] = temp as T;
    }
    return a;
  };

  const byResource = new Map<string, CareTask[]>();
  for (const rt of RESOURCE_TYPES) byResource.set(rt, []);
  for (const task of allTasks) byResource.get(task.rewardResource)?.push(task);

  const selected: CareTask[] = [];
  const usedIds = new Set<string>();
  for (const rt of RESOURCE_TYPES) {
    const group = shuffle(byResource.get(rt) ?? []);
    if (group.length > 0) {
      const first = group[0]!;
      selected.push(first);
      usedIds.add(first.id);
    }
  }

  const remaining = shuffle(allTasks.filter((task) => !usedIds.has(task.id)));
  for (const task of remaining) {
    if (selected.length >= DAILY_LIMIT) break;
    selected.push(task);
  }

  return shuffle(selected);
}

async function completeTaskForUser(userId: string, careTaskId: string, virtualPlantId?: string) {
  const taskDate = new Date();
  taskDate.setHours(0, 0, 0, 0);

  const careTask = await prisma.careTask.findUnique({ where: { id: careTaskId } });
  if (!careTask) return null;

  const existingLog = await prisma.careTaskLog.findUnique({
    where: {
      userId_careTaskId_taskDate: { userId, careTaskId, taskDate },
    },
    include: { careTask: true },
  });
  if (existingLog) return existingLog;

  const log = await prisma.careTaskLog.create({
    data: { userId, careTaskId, virtualPlantId, taskDate, completedAt: new Date() },
    include: { careTask: true },
  });

  if (virtualPlantId) {
    const resourceField: Record<string, object> = {
      WATER:      { waterAmount:      { increment: careTask.rewardAmount } },
      SUNLIGHT:   { sunlightAmount:   { increment: careTask.rewardAmount } },
      FERTILIZER: { fertilizerAmount: { increment: careTask.rewardAmount } },
      AIR:        { airAmount:        { increment: careTask.rewardAmount } },
      LOVE:       { loveAmount:       { increment: careTask.rewardAmount } },
      DEW:        { dewAmount:        { increment: careTask.rewardAmount } },
    };

    const yesterday = new Date(taskDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayLog = await prisma.careTaskLog.findFirst({
      where: { userId, taskDate: yesterday, virtualPlantId },
    });

    await prisma.virtualPlant.update({
      where: { id: virtualPlantId },
      data: {
        ...(resourceField[careTask.rewardResource] ?? {}),
        growthPoint: { increment: careTask.growthReward },
        lastCaredAt: new Date(),
        streakCount: yesterdayLog ? { increment: 1 } : 1,
      },
    });
  }

  return log;
}

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const allTasks = await prisma.careTask.findMany({
      where: { isActive: true },
    });
    return res.status(200).json({ data: selectDailyTasks(allTasks) });
  } catch (err) { next(err); }
};

export const getQuizzes = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const allTasks = await prisma.careTask.findMany({
      where: { isActive: true },
    });
    return res.status(200).json({ data: selectDailyTasks(allTasks).map(toPublicQuiz) });
  } catch (err) { next(err); }
};

export const answerQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { careTaskId, selectedOptionIndex, virtualPlantId } = req.body;

    const careTask = await prisma.careTask.findUnique({ where: { id: careTaskId } });
    if (!careTask || !careTask.isActive) {
      return res.status(404).json({ message: "CareTask quiz not found" });
    }

    const quiz = buildQuiz(careTask);
    if (selectedOptionIndex !== quiz.correctOptionIndex) {
      return res.status(200).json({
        data: {
          correct: false,
          correctOptionIndex: quiz.correctOptionIndex,
          message: "Đáp án chưa đúng",
        },
      });
    }

    const log = await completeTaskForUser(userId, careTaskId, virtualPlantId);
    return res.status(201).json({
      message: "Quiz answered correctly",
      data: {
        correct: true,
        log,
        rewardResource: careTask.rewardResource,
        rewardAmount: careTask.rewardAmount,
        growthReward: careTask.growthReward,
      },
    });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file as any;
    const {
      title, description, type, isDefault,
      rewardResource, rewardAmount, growthReward,
      verifyType, durationSeconds,
    } = req.body;

    if (!title || !type) {
      return res.status(400).json({ message: "title and type are required" });
    }

    const task = await prisma.careTask.create({
      data: {
        title,
        description: description ?? undefined,
        type: type as any,
        isDefault: isDefault !== undefined ? (isDefault === "true" || isDefault === true) : true,
        rewardResource: (rewardResource ?? "WATER") as any,
        rewardAmount: rewardAmount ? parseInt(String(rewardAmount)) : 10,
        growthReward: growthReward ? parseInt(String(growthReward)) : 5,
        verifyType: (verifyType ?? "SELF_CONFIRM") as any,
        durationSeconds: durationSeconds ? parseInt(String(durationSeconds)) : undefined,
        characterImageUrl: file?.path ?? undefined,
      },
    });
    return res.status(201).json({ message: "CareTask created", data: task });
  } catch (err) { next(err); }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const task = await prisma.careTask.update({
      where: { id: id as string },
      data: req.body,
    });
    return res.status(200).json({ message: "CareTask updated", data: task });
  } catch (err) { next(err); }
};

export const uploadCharacterImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const file = req.file as any;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const task = await prisma.careTask.update({
      where: { id: id as string },
      data: { characterImageUrl: file.path },
    });

    return res.status(200).json({
      message: "Character image uploaded successfully",
      data: { id: task.id, characterImageUrl: task.characterImageUrl },
    });
  } catch (err) { next(err); }
};

export const deleteCharacterImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const task = await prisma.careTask.update({
      where: { id: id as string },
      data: { characterImageUrl: null },
    });
    return res.status(200).json({
      message: "Character image removed",
      data: { id: task.id },
    });
  } catch (err) { next(err); }
};

export const completeTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { careTaskId, virtualPlantId } = req.body;
    const log = await completeTaskForUser(userId, careTaskId, virtualPlantId);
    if (!log) return res.status(404).json({ message: "CareTask not found" });
    return res.status(201).json({ message: "Task completed", data: log });
  } catch (err) { next(err); }
};

export const getMyLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await prisma.careTaskLog.findMany({
      where: { userId, taskDate: today },
      include: { careTask: true, virtualPlant: { select: { id: true, nickname: true } } },
      orderBy: { completedAt: "desc" },
    });
    return res.status(200).json({ data: logs });
  } catch (err) { next(err); }
};
