import type { Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma.js";

// POST /api/virtual-plants/start  — user chọn hoa, BE tìm cây thật còn trống rồi tạo cây ảo
export const start = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { flowerTypeId, nickname } = req.body;

    // Tìm cây thật chưa bị gắn với cây ảo nào
    const availablePlant = await prisma.realPlant.findFirst({
      where: {
        flowerTypeId,
        isAssigned: false,
        status: "SEED",
      },
    });
    if (!availablePlant) {
      return res.status(409).json({ message: "No available real plant for this flower type" });
    }

    const [virtualPlant] = await prisma.$transaction([
      prisma.virtualPlant.create({
        data: { userId, flowerTypeId, realPlantId: availablePlant.id, nickname },
        include: { flowerType: true, realPlant: true },
      }),
      prisma.realPlant.update({
        where: { id: availablePlant.id },
        data: { isAssigned: true },
      }),
    ]);

    return res.status(201).json({ message: "Virtual plant started", data: virtualPlant });
  } catch (err) { next(err); }
};

// GET /api/virtual-plants/my  — lấy cây ảo của user đang đăng nhập
export const getMy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const plants = await prisma.virtualPlant.findMany({
      where: { userId },
      include: {
        flowerType: true,
        realPlant: {
          include: {
            updates: { orderBy: { createdAt: "desc" }, take: 1 }, // ảnh mới nhất
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ data: plants });
  } catch (err) { next(err); }
};

// GET /api/virtual-plants/:id  — chi tiết cây ảo
export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const plant = await prisma.virtualPlant.findFirst({
      where: { id: req.params.id as string, userId },
      include: {
        flowerType: true,
        realPlant: {
          include: { garden: true },
        },
      },
    });
    if (!plant) return res.status(404).json({ message: "Virtual plant not found" });
    return res.status(200).json({ data: plant });
  } catch (err) { next(err); }
};

// GET /api/virtual-plants/:id/timeline  — lịch sử cập nhật của cây thật gắn với cây ảo này
export const getTimeline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const plant = await prisma.virtualPlant.findFirst({
      where: { id: req.params.id as string, userId },
      select: { realPlantId: true },
    });
    if (!plant) return res.status(404).json({ message: "Virtual plant not found" });

    const updates = await prisma.plantUpdate.findMany({
      where: { realPlantId: plant.realPlantId },
      include: { farmer: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ data: updates });
  } catch (err) { next(err); }
};

// PATCH /api/virtual-plants/:id  — user đổi nickname
export const updateNickname = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { nickname } = req.body;
    const plant = await prisma.virtualPlant.updateMany({
      where: { id: req.params.id as string, userId },
      data: { nickname },
    });
    if (plant.count === 0) return res.status(404).json({ message: "Virtual plant not found" });
    return res.status(200).json({ message: "Nickname updated" });
  } catch (err) { next(err); }
};
