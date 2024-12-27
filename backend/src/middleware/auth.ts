import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import User from "../models/user.model";
import RefreshToken from "../models/refreshToken.model";
import { IUser } from "../types/user";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    role?: string;
  };
}

interface JwtPayload {
  userId: string;
  type?: string;
}

const extractToken = (req: Request): string | null => {
  // First try Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  // Then try access token cookie
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
};

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Verify token type
    if (decoded.type && decoded.type !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid token type",
      });
    }

    // Convert string ID to ObjectId
    let userId: Types.ObjectId;
    try {
      userId = new Types.ObjectId(decoded.userId);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID format",
        code: "INVALID_ID",
      });
    }

    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    req.user = { _id: user._id, role: user.role };
    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }
    res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};
