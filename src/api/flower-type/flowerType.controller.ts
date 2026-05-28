import type { Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma.js";

// GET /api/flower-types
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const types = await prisma.flowerType.findMany({
      orderBy: { name: "asc" },
      include: {
        realPlants: {
          where: { isAssigned: false, status: "SEED" },
          select: {
            id: true,
            garden: {
              select: { id: true, name: true, address: true },
            },
          },
        },
      },
    });

    // Gom nhà vườn unique + đếm cây sẵn có cho mỗi loại
    const result = types.map((ft) => {
      const gardensMap = new Map<string, { id: string; name: string; address?: string | null }>();
      for (const rp of ft.realPlants) {
        if (!gardensMap.has(rp.garden.id)) {
          gardensMap.set(rp.garden.id, rp.garden);
        }
      }
      const { realPlants, ...rest } = ft;
      return {
        ...rest,
        availableCount: realPlants.length,          // Số cây SEED chưa gắn
        gardens: Array.from(gardensMap.values()),    // Nhà vườn có cây loại này
      };
    });

    return res.status(200).json({ data: result });
  } catch (err) { next(err); }
};


// GET /api/flower-types/:id
export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = await prisma.flowerType.findUnique({ where: { id: req.params.id as string } });
    if (!type) return res.status(404).json({ message: "FlowerType not found" });
    return res.status(200).json({ data: type });
  } catch (err) { next(err); }
};

// Helper xóa undefined khỏi JSON objects để Prisma không lỗi
const sanitizeJson = (obj: any) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  const newObj: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) newObj[k] = v;
  }
  return Object.keys(newObj).length > 0 ? newObj : undefined;
};

// POST /api/flower-types  [ADMIN]
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, imageUrl, defaultDuration, stageImages, stageDurations } = req.body;
    const type = await prisma.flowerType.create({
      data: {
        name, description, imageUrl, defaultDuration,
        stageImages: sanitizeJson(stageImages),
        stageDurations: sanitizeJson(stageDurations),
      },
    });
    return res.status(201).json({ message: "FlowerType created", data: type });
  } catch (err) { next(err); }
};

// PUT /api/flower-types/:id  [ADMIN]
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stageImages, stageDurations, ...rest } = req.body;
    const type = await prisma.flowerType.update({
      where: { id: req.params.id as string },
      data: {
        ...rest,
        ...(stageImages !== undefined ? { stageImages: sanitizeJson(stageImages) || null } : {}),
        ...(stageDurations !== undefined ? { stageDurations: sanitizeJson(stageDurations) || null } : {}),
      },
    });
    return res.status(200).json({ message: "FlowerType updated", data: type });
  } catch (err) { next(err); }
};

// DELETE /api/flower-types/:id  [ADMIN]
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.flowerType.delete({ where: { id: req.params.id as string } });
    return res.status(200).json({ message: "FlowerType deleted" });
  } catch (err) { next(err); }
};
