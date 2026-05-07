import { Router, type Request, type Response } from "express";
import authRoutes from "./auth/auth.route.js";
import adminAccountRoutes from "./admin/account/account.route.js";
import adminReportRoutes from "./admin/report/report.route.js";
import roleRoutes from "./user/user.route.js";
import facyltyRoutes from "./admin/Faculty/faculty.route.js";
import RoomRoutes from "./admin/room/room.route.js";
import TimetableRoutes from "./admin/timetable/timetable.route.js";
import AppointmentRoutes from "./admin/appointment/appoint.route.js";
import medicineRoutes from "./medicine/medicine.route.js";
import ExamineRouter from "./examine/examine.route.js";
import { paginateMiddleware } from "../middlewares/paginate.js";
import PrescriptionRouter from "./prescription/prescription.route.js";
import TestRouter from "./test/test.route.js";
import notificationRoutes from "./notification/notification.route.js";
const router = Router();

// Setup custom output for specific routes
router.use(paginateMiddleware);

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the API" });
});
router.use("/auth", authRoutes);
router.use("/user", roleRoutes);
router.use("/admin/account", adminAccountRoutes);
router.use("/admin/report", adminReportRoutes);
router.use("/admin/faculty", facyltyRoutes);
router.use("/admin/rooms", RoomRoutes);
router.use("/admin/timetables", TimetableRoutes);
router.use("/admin/appointments", AppointmentRoutes);
router.use("/medicine", medicineRoutes);

router.use("/examine", ExamineRouter);
router.use("/prescription", PrescriptionRouter);
router.use("/notification", notificationRoutes);
// For testing purposes, you can add a route to check if the API is working
router.use("/test", TestRouter);
export default router;
