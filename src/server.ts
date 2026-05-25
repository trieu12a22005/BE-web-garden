import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./api/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { setupSwagger } from "./swagger.js";

const app = express();

const isDev = process.env.NODE_ENV !== "production";

const corsOptions = {
  // Dev: cho phép tất cả origins (mobile app không có origin cố định)
  // Production: liệt kê cụ thể
  origin: isDev
    ? true  // Cho phép tất cả origins trong dev
    : ["https://your-production-domain.com"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept"],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400,
};


app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);

app.get("/", (_req: Request, res: Response) => {
  res.send("Garden-BE Server is running 🌱");
});

app.use("/api/v1", apiRoutes);
app.use(errorHandler);

export default app;
