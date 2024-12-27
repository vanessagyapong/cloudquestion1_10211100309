import { Gender, User, UserPreferences } from "./user";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  bio?: string;
  preferences?: UserPreferences;
}

export interface TokenData {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface TokenResponse {
  data: TokenData;
  message: string;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
  message: string;
}

export interface AuthResponse {
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  message: string;
}
