import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { uploadGeneral } from "../../middlewares/upload.middleware.js";

const router = Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a general image to Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 url:
 *                   type: string
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "FARMER"),
  uploadGeneral.single("image"),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    return res.status(200).json({
      message: "Upload successful",
      url: req.file.path,
    });
  }
);

export default router;
