import { Router } from "express";
import { getExaminationList, getExaminationTicket, getPatientList, getPaymentBill, getMonthlyRevenue, getMedicineUsage } from "./report.controller.js";
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

/**
 * @swagger
 * /admin/report/patient-list:
 *   get:
 *     summary: Export Danh sách bệnh nhân (BM3)
 *     description: Lấy danh sách bệnh nhân khám bệnh trong ngày theo biểu mẫu 3
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
 *         description: Trả về danh sách bệnh nhân
 *       400:
 *         description: Bad request (Thiếu ngày)
 *       401:
 *         description: Unauthorized
 */
router.get("/patient-list", verifyAccessToken, getPatientList);

/**
 * @swagger
 * /admin/report/payment-bill/{examineId}:
 *   get:
 *     summary: Export Hóa đơn thanh toán (BM4)
 *     description: Lấy thông tin hóa đơn thanh toán theo biểu mẫu 4
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
 *         description: "ID của phiên khám"
 *     responses:
 *       200:
 *         description: Trả về chi tiết hóa đơn
 *       400:
 *         description: Bad request (Thiếu ID)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Không tìm thấy phiên khám
 */
router.get("/payment-bill/:examineId", verifyAccessToken, getPaymentBill);

/**
 * @swagger
 * /admin/report/monthly-revenue:
 *   get:
 *     summary: Export Báo cáo doanh thu theo tháng (BM5.1)
 *     description: Lấy báo cáo doanh thu theo tháng theo biểu mẫu 5.1
 *     tags:
 *       - Report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2023
 *     responses:
 *       200:
 *         description: Trả về báo cáo doanh thu
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get("/monthly-revenue", verifyAccessToken, getMonthlyRevenue);

/**
 * @swagger
 * /admin/report/medicine-usage:
 *   get:
 *     summary: Export Báo cáo sử dụng thuốc (BM5.2)
 *     description: Lấy báo cáo sử dụng thuốc theo tháng theo biểu mẫu 5.2
 *     tags:
 *       - Report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2023
 *     responses:
 *       200:
 *         description: Trả về báo cáo sử dụng thuốc
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get("/medicine-usage", verifyAccessToken, getMedicineUsage);

export default router;
