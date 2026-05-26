import type { Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma.js";

// GET /api/flower-types
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const types = await prisma.flowerType.findMany({ orderBy: { name: "asc" } });
    return res.status(200).json({ data: types });
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

// POST /api/flower-types  [ADMIN]
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, imageUrl, defaultDuration } = req.body;
    const type = await prisma.flowerType.create({ data: { name, description, imageUrl, defaultDuration } });
    return res.status(201).json({ message: "FlowerType created", data: type });
  } catch (err) { next(err); }
};

// PUT /api/flower-types/:id  [ADMIN]
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = await prisma.flowerType.update({
      where: { id: req.params.id as string },
      data: req.body,
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
