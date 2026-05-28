import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ── Storage cho ảnh nhân vật task ─────────────────────────────────────────────
const characterStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         "garden/task-characters",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    // background_removal: "cloudinary_ai", // Tạm tắt tính năng này để tránh lỗi nếu tài khoản chưa có Add-on
    transformation: [{ width: 400, height: 400, crop: "limit", quality: "auto" }],
  } as any,
});

// ── Storage chung (garden, plant update...) ───────────────────────────────────
const generalStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         "garden/general",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
  } as any,
});

export const uploadCharacter = multer({
  storage: characterStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadGeneral = multer({
  storage: generalStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
