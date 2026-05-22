import type { Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma.js";

// POST /api/mood-journals
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { mood, note } = req.body;
    const journal = await prisma.moodJournal.create({ data: { userId, mood, note } });
    return res.status(201).json({ message: "Mood journal created", data: journal });
  } catch (err) { next(err); }
};

// GET /api/mood-journals/my
export const getMy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { limit = "20", offset = "0" } = req.query;
    const journals = await prisma.moodJournal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: Number(limit),
      skip: Number(offset),
    });
    const total = await prisma.moodJournal.count({ where: { userId } });
    return res.paginate(journals, {
      totalItems: total,
      totalPages: Math.ceil(total / Number(limit)),
      itemCount: journals.length,
      currentPage: Math.floor(Number(offset) / Number(limit)) + 1,
    });
  } catch (err) { next(err); }
};

// DELETE /api/mood-journals/:id
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const deleted = await prisma.moodJournal.deleteMany({
      where: { id: req.params.id as string, userId },
    });
    if (deleted.count === 0) return res.status(404).json({ message: "Journal not found" });
    return res.status(200).json({ message: "Journal deleted" });
  } catch (err) { next(err); }
};
