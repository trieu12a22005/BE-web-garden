import type { Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma.js";

// ── Seeded PRNG (mulberry32) — deterministic random từ seed số nguyên ─────────
function seededRandom(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ── Seed theo ngày (YYYYMMDD) — đổi mới mỗi 24h ────────────────────────────
function todaySeed(): number {
  const d = new Date();
  return parseInt(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`);
}

// GET /api/care-tasks — trả 10 task/ngày, đảm bảo đủ 6 loại tài nguyên
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allTasks = await prisma.careTask.findMany({
      where: { isActive: true },
    });

    const RESOURCE_TYPES = ["WATER", "SUNLIGHT", "FERTILIZER", "AIR", "LOVE", "DEW"];
    const DAILY_LIMIT = 10;

    // Nhóm task theo loại tài nguyên
    const byResource = new Map<string, typeof allTasks>();
    for (const rt of RESOURCE_TYPES) byResource.set(rt, []);
    for (const t of allTasks) byResource.get(t.rewardResource)?.push(t);

    const rand = seededRandom(todaySeed());

    // Shuffle helper dùng seeded random
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

    // Bước 1: lấy 1 task ngẫu nhiên từ mỗi loại tài nguyên (tối đa 6)
    const selected: typeof allTasks = [];
    const usedIds = new Set<string>();
    for (const rt of RESOURCE_TYPES) {
      const group = shuffle(byResource.get(rt) ?? []);
      if (group.length > 0) {
        const first = group[0]!;
        selected.push(first);
        usedIds.add(first.id);
      }
    }

    // Bước 2: điền thêm từ pool còn lại cho đủ DAILY_LIMIT
    const remaining = shuffle(allTasks.filter((t) => !usedIds.has(t.id)));
    for (const t of remaining) {
      if (selected.length >= DAILY_LIMIT) break;
      selected.push(t);
    }

    // Shuffle lại lần cuối để thứ tự hiển thị không cố định
    return res.status(200).json({ data: shuffle(selected) });
  } catch (err) { next(err); }
};

// POST /api/care-tasks  [ADMIN] — multipart/form-data, ảnh image là tùy chọn
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file as any; // Dùng any để tránh lỗi namespace Express.Multer

    // multipart gửi tất cả field dưới dạng string — cần parse
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

// PATCH /api/care-tasks/:id  [ADMIN] — cập nhật thông tin task (không gồm ảnh)
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

// POST /api/care-tasks/:id/character-image  [ADMIN] — upload hoạt ảnh nhân vật
export const uploadCharacterImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // multer-storage-cloudinary tự upload, req.file.path = URL Cloudinary
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

// DELETE /api/care-tasks/:id/character-image  [ADMIN] — xóa ảnh nhân vật
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

// POST /api/care-task-logs  — user hoàn thành 1 task hôm nay
export const completeTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { careTaskId, virtualPlantId } = req.body;

    const taskDate = new Date();
    taskDate.setHours(0, 0, 0, 0);

    // Lấy thông tin phần thưởng thực của task
    const careTask = await prisma.careTask.findUnique({ where: { id: careTaskId } });
    if (!careTask) return res.status(404).json({ message: "CareTask not found" });

    const log = await prisma.careTaskLog.create({
      data: { userId, careTaskId, virtualPlantId, taskDate, completedAt: new Date() },
      include: { careTask: true },
    });

    // Cập nhật tài nguyên cây ảo — increment đúng field theo rewardResource
    if (virtualPlantId) {
      // Map ResourceType → tên field trong DB
      const resourceField: Record<string, object> = {
        WATER:      { waterAmount:      { increment: careTask.rewardAmount } },
        SUNLIGHT:   { sunlightAmount:   { increment: careTask.rewardAmount } },
        FERTILIZER: { fertilizerAmount: { increment: careTask.rewardAmount } },
        AIR:        { airAmount:        { increment: careTask.rewardAmount } },
        LOVE:       { loveAmount:       { increment: careTask.rewardAmount } },
        DEW:        { dewAmount:        { increment: careTask.rewardAmount } },
      };

      const resourceUpdate = resourceField[careTask.rewardResource] ?? {};

      // Streak: kiểm tra xem hôm qua user có chăm sóc không
      const yesterday = new Date(taskDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayLog = await prisma.careTaskLog.findFirst({
        where: { userId, taskDate: yesterday, virtualPlantId },
      });

      await prisma.virtualPlant.update({
        where: { id: virtualPlantId },
        data: {
          ...resourceUpdate,
          growthPoint: { increment: careTask.growthReward }, // giữ cho thành tích
          lastCaredAt: new Date(),
          streakCount: yesterdayLog ? { increment: 1 } : 1,
        },
      });
    }

    return res.status(201).json({ message: "Task completed", data: log });
  } catch (err) { next(err); }
};

// GET /api/care-task-logs/my  — lịch sử task hôm nay của user
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
