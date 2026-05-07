import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { findRefreshTokenInWhitelist } from "../api/auth/auth.service.js";
import authorizationService from "../services/authorization/authorization.service.js";

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in environment`);
  return v;
}

const JWT_SECRET = mustGetEnv("JWT_SECRET");

type AuthPayload = { id: string; email: string; role: string; roleName?: string | null; roleID?: string | null };
// type AuthPayload = JwtPayload// & { permissions?: string[] | null };

//tự tạo type Request có user
// export interface AuthedRequest extends Request {
//   user?: AuthPayload;
// }
function isAuthPayload(p: unknown): p is AuthPayload {
  if (!p || typeof p !== "object") return false;
  const obj = p as Record<string, unknown>;
  return typeof obj.id === "string" && typeof obj.email === "string";
}

export async function verifyAccessToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ message: "Missing access token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload | string;

    if (typeof decoded === "string" || !isAuthPayload(decoded)) {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    // Get permissions list and cache it (if not cached) for the user's role
    const permissions = await authorizationService.getPermissionsListByRole(decoded?.roleID, decoded?.roleName);
    // attach user info to request object for downstream handlers
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role, permissions };

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}
export const verifyRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies?.refreshToken;
  console.log("Refresh token in cookie:", refreshToken);

  if (!refreshToken) {
    return res.status(401).json({ message: "Missing refresh token" });
  }

  const tokenInDb = await findRefreshTokenInWhitelist(refreshToken);
  if (!tokenInDb) {
    // clear đúng path bạn set refresh cookie
    res.clearCookie("refreshToken", { path: "/" });
    res.clearCookie("accessToken", { path: "/" });
    return res.status(401).json({ message: "Refresh token revoked or expired" });
  }

  req.id = tokenInDb.userId;
  return next();
};
