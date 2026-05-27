import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { getAllUsers, toggleActive } from "./user.controller.js";

const router = Router();

// Only ADMIN can manage users
router.use(authenticate, authorize("ADMIN"));

router.get("/", getAllUsers);
router.patch("/:id", toggleActive);

export default router;
