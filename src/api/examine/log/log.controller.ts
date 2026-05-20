import type { Request, Response, NextFunction } from "express";
import ExamineLogService from "./log.service.js";
export async function createExamineLogHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const examinedBy = req.user?.id;
    const payload = { ...req.body, examinedBy };
    const result = await ExamineLogService.submit(payload);
    return res.json({ message: "Tạo mới hồ sơ khám bệnh thành công", data: result });
  } catch (error) {
    next(error);
  }
}

export async function getExamineLogHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await ExamineLogService.getExamineLogByID(id as string);
    return res.json({ examineLog: result });
  } catch (error) {
    next(error);
  }
}

export async function getExamineLogByTicketIDHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { ticketID } = req.params;
    const result = await ExamineLogService.getExamineLogByTicketID(ticketID as string);
    return res.json({ examineLog: result });
  } catch (error) {
    next(error);
  }
}
export async function getExamineLogWithPrescriptionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await ExamineLogService.getExamineLogByID(id as string, true);
    return res.json({ examineLog: result });
  } catch (error) {
    next(error);
  }
}
export async function updateExamineLogHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await ExamineLogService.updateExamineLog(id as string, req.body);
    return res.json({ message: "Đã cập nhật hồ sơ khám bệnh", data: result });
  } catch (error) {
    next(error);
  }
}

export async function getPrintableExamineLogHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await ExamineLogService.getPrintableExamineLog(id as string);
    return res.json({ examineLog: result });
  } catch (error) {
    next(error);
  }
}
