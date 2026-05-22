import type { Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma.js";

// GET /api/care-tasks  — danh sách task
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await prisma.careTask.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return res.status(200).json({ data: tasks });
  } catch (err) { next(err); }
};

// POST /api/care-tasks  [ADMIN]
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.careTask.create({ data: req.body });
    return res.status(201).json({ message: "CareTask created", data: task });
  } catch (err) { next(err); }
};

// POST /api/care-task-logs  — user hoàn thành 1 task hôm nay
export const completeTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { careTaskId, virtualPlantId } = req.body;

    const taskDate = new Date();
    taskDate.setHours(0, 0, 0, 0);

    const log = await prisma.careTaskLog.create({
      data: { userId, careTaskId, virtualPlantId, taskDate, completedAt: new Date() },
      include: { careTask: true },
    });

    // Tăng growthPoint của cây ảo nếu task gắn với cây ảo
    if (virtualPlantId) {
      await prisma.virtualPlant.update({
        where: { id: virtualPlantId },
        data: { growthPoint: { increment: 10 } },
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
