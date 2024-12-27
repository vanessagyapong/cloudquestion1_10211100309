import { Request, Response } from "express";
import { IUser } from "./user";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export type AsyncRequestHandler = (
  req: AuthenticatedRequest,
  res: Response
) => Promise<any>;
