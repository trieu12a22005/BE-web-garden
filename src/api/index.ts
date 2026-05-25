import { Router, type Request, type Response } from "express";
import { paginateMiddleware } from "../middlewares/paginate.js";
import authRoutes from "./auth/auth.route.js";
import flowerTypeRoutes from "./flower-type/flowerType.route.js";
import gardenRoutes from "./garden/garden.route.js";
import realPlantRoutes from "./real-plant/realPlant.route.js";
import virtualPlantRoutes from "./virtual-plant/virtualPlant.route.js";
import plantUpdateRoutes from "./plant-update/plantUpdate.route.js";
import moodJournalRoutes from "./mood-journal/moodJournal.route.js";
import careTaskRoutes from "./care-task/careTask.route.js";
import notificationRoutes from "./notification/notification.route.js";

const router = Router();

router.use(paginateMiddleware);

router.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Garden-BE API v1" });
});

router.use("/auth", authRoutes);
router.use("/flower-types", flowerTypeRoutes);
router.use("/gardens", gardenRoutes);
router.use("/real-plants", realPlantRoutes);
router.use("/virtual-plants", virtualPlantRoutes);
router.use("/plant-updates", plantUpdateRoutes);
router.use("/mood-journals", moodJournalRoutes);
router.use("/care-tasks", careTaskRoutes);
router.use("/notifications", notificationRoutes);

export default router;
