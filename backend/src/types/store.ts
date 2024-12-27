import { Document, Types } from "mongoose";
import type { IUser } from "./user";

export interface IStore extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  owner: Types.ObjectId | IUser;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
  logo?: string;
  banner?: string;
  createdAt: Date;
  updatedAt: Date;
}
