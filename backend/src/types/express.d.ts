import { IUser } from "../models/user.model";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export type ExpressHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type RequestHandler = ExpressHandler;
export type AsyncRequestHandler = AsyncHandler;
