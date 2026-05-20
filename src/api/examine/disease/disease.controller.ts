import type { Request, Response, NextFunction } from "express";
import diseaseService from "./disease.service.js";

export async function findDiseaseByWords(req: Request, res: Response, next: NextFunction) {
  try {
    const { keyword } = req.query ?? {};
    if (!keyword) return res.status(200).send({ message: "Must type a word", data: [] });
    const list = await diseaseService.findDiseaseByWord(keyword as string);
    if (list) {
      return res.status(200).send({ message: "OK", data: list });
    } else {
      return res.status(200).send({ message: "No disease matches!", data: [] });
    }
  } catch (error) {
    next(error);
  }
}

export async function searchDiseaseByName(req: Request, res: Response, next: NextFunction) {
  try {
    const { keyword } = req.query ?? {};
    if (!keyword) return res.status(200).send({ message: "Must type a word", data: [] });
    const list = await diseaseService.searchDiseaseByName(keyword as string);
    if (list) {
      return res.status(200).send({ message: "OK", data: list });
    } else {
      return res.status(200).send({ message: "No disease matches!", data: [] });
    }
  } catch (error) {
    next(error);
  }
}
