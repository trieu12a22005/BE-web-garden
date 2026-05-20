import { Router } from "express";
import { findDiseaseByWords, searchDiseaseByName } from "./disease.controller.js";

const diseaseRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Disease
 *     description: Disease catalog lookup for examine flows
 *
 * components:
 *   schemas:
 *     Disease:
 *       type: object
 *       properties:
 *         diseaseID:
 *           type: string
 *           maxLength: 5
 *           description: ICD-style disease code stored in the system
 *           example: J00
 *         diseaseName:
 *           type: string
 *           maxLength: 255
 *           description: Human-readable disease name
 *           example: Acute nasopharyngitis (common cold)
 *       required:
 *         - diseaseID
 *         - diseaseName
 *
 * /examine/disease/find:
 *   get:
 *     summary: Find diseases by code prefix
 *     description: |
 *       Returns up to 10 diseases whose `diseaseID` starts with the provided keyword.
 *       This is designed for quick typeahead lookup by disease code.
 *     tags:
 *       - Disease
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         description: Disease code prefix to search (case-sensitive)
 *         schema:
 *           type: string
 *           minLength: 1
 *           example: J0
 *     responses:
 *       200:
 *         description: Matching diseases (or empty list when no matches)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Disease'
 *             examples:
 *               found:
 *                 summary: Matches found
 *                 value:
 *                   message: OK
 *                   data:
 *                     - diseaseID: J00
 *                       diseaseName: Acute nasopharyngitis (common cold)
 *                     - diseaseID: J01
 *                       diseaseName: Acute sinusitis
 *               missingKeyword:
 *                 summary: Keyword is missing
 *                 value:
 *                   message: Must type a word
 *                   data: []
 *               noMatches:
 *                 summary: No matches for the keyword
 *                 value:
 *                   message: No disease matches!
 *                   data: []
 */
diseaseRouter.get("/find", findDiseaseByWords);

/**
 * @swagger
 * /examine/disease/search:
 *   get:
 *     summary: Search diseases by name keyword
 *     description: |
 *       Returns up to 10 diseases whose `diseaseName` contains the provided keyword.
 *       The search is case-insensitive and supports partial matching anywhere in the name.
 *     tags:
 *       - Disease
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         description: Partial or full disease name to search (case-insensitive)
 *         schema:
 *           type: string
 *           minLength: 1
 *           example: nasopharyngitis
 *     responses:
 *       200:
 *         description: Matching diseases (or empty list when no matches)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Disease'
 *             examples:
 *               found:
 *                 summary: Matches found
 *                 value:
 *                   message: OK
 *                   data:
 *                     - diseaseID: J00
 *                       diseaseName: Acute nasopharyngitis (common cold)
 *               missingKeyword:
 *                 summary: Keyword is missing
 *                 value:
 *                   message: Must type a keyword
 *                   data: []
 *               noMatches:
 *                 summary: No matches for the keyword
 *                 value:
 *                   message: No disease matches!
 *                   data: []
 */
diseaseRouter.get("/search", searchDiseaseByName);

export default diseaseRouter;
