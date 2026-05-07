import { Router } from "express";
import { getExaminationList, getExaminationTicket } from "./report.controller.js";
import { verifyAccessToken } from "../../../middlewares/verifyToken.js";

const router = Router();

/**
 * @swagger
 * /admin/report/examination-list:
 *   get:
 *     summary: Export Danh sách khám bệnh (BM1)
 *     description: Lấy danh sách khám bệnh trong ngày theo biểu mẫu 1
 *     tags:
 *       - Report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2023-10-25"
 *         description: "Ngày khám bệnh (YYYY-MM-DD)"
 *     responses:
 *       200:
 *         description: Trả về danh sách khám bệnh
 *       400:
 *         description: Bad request (Thiếu ngày)
 *       401:
 *         description: Unauthorized
 */
router.get("/examination-list", verifyAccessToken, getExaminationList);

/**
 * @swagger
 * /admin/report/examination-ticket/{examineId}:
 *   get:
 *     summary: Export Phiếu khám bệnh (BM2)
 *     description: Lấy thông tin chi tiết phiếu khám bệnh theo biểu mẫu 2
 *     tags:
 *       - Report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examineId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: "ID của phiếu khám"
 *     responses:
 *       200:
 *         description: Trả về chi tiết phiếu khám và đơn thuốc
 *       400:
 *         description: Bad request (Thiếu ID)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Không tìm thấy phiếu khám
 */
router.get("/examination-ticket/:examineId", verifyAccessToken, getExaminationTicket);

export default router;
