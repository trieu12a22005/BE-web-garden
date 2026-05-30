import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { getAllUsers, toggleActive, savePushToken } from "./user.controller.js";

const router = Router();

// Lưu push token — bất kỳ user đã login (USER, FARMER, ADMIN)
router.patch("/push-token", authenticate, savePushToken);

// Các route dưới đây chỉ ADMIN
router.use(authenticate, authorize("ADMIN"));
router.get("/", getAllUsers);
router.patch("/:id", toggleActive);

export default router;
