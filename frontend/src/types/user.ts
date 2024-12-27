export type UserRole = "user" | "admin" | "seller";
export type SellerStatus = "pending" | "approved" | "rejected" | null;

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export interface Store {
  _id: string;
  name: string;
  description: string;
  owner: string;
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  bio?: string;
  role: UserRole;
  isSeller?: boolean;
  isActive: boolean;
  store?: Store;
  preferences: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: Gender;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  headers?: {
    [key: string]: string;
  };
}

export interface AuthResponse {
  user: User;
  tokens: Tokens;
}

export interface StoreCreationData {
  name: string;
  description: string;
  contactPhone: string;
  address: string;
}
