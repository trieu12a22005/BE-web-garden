import type { Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma.js";

// POST /api/plant-updates  [FARMER]
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = req.user!.id;
    const { realPlantId, imageUrl, status, note, healthNote } = req.body;

    // Cập nhật trạng thái cây thật đồng thời
    await prisma.realPlant.update({ where: { id: realPlantId }, data: { status } });

    const update = await prisma.plantUpdate.create({
      data: { realPlantId, farmerId, imageUrl, status, note, healthNote },
    });

    // Đồng bộ trạng thái sang cây ảo gắn với cây thật này
    await prisma.virtualPlant.updateMany({
      where: { realPlantId },
      data: { status },
    });

    return res.status(201).json({ message: "Plant update created", data: update });
  } catch (err) { next(err); }
};

// GET /api/plant-updates/:realPlantId  — lấy toàn bộ lịch sử cập nhật của cây thật
export const getByRealPlant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = await prisma.plantUpdate.findMany({
      where: { realPlantId: req.params.realPlantId as string },
      include: { farmer: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ data: updates });
  } catch (err) { next(err); }
};

// GET /api/plant-updates/all  [ADMIN]
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gardenId } = req.query;

    // Nếu có truyền gardenId thì lấy cây trong vườn đó
    const whereClause: any = {};
    if (gardenId) {
      whereClause.realPlant = { gardenId: String(gardenId) };
    }

    const updates = await prisma.plantUpdate.findMany({
      where: whereClause,
      include: {
        farmer: { select: { id: true, fullName: true } },
        realPlant: { select: { id: true, code: true } }
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ data: updates });
  } catch (err) { next(err); }
};
