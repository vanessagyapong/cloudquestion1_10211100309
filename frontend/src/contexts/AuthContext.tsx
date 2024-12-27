"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authApi, userApi } from "@/services/api";
import { User } from "@/types/user";
import { RegisterData, ApiError } from "@/types/auth";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes

const setAuthCookies = (
  accessToken: string,
  refreshToken: string,
  role: string
) => {
  // Set HTTP-only cookies with secure flag in production
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    secure: isProduction,
    sameSite: "strict" as const,
    path: "/",
    expires: 7, // 7 days
  };

  Cookies.set("token", accessToken, cookieOptions);
  Cookies.set("refreshToken", refreshToken, cookieOptions);
  Cookies.set("userRole", role, cookieOptions);
};

const clearAuthCookies = () => {
  Cookies.remove("token");
  Cookies.remove("refreshToken");
  Cookies.remove("userRole");
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogout = useCallback(() => {
    clearAuthCookies();
    setUser(null);
    router.push("/");
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await userApi.getProfile();
      setUser(response.data.data);
    } catch (error) {
      console.error("Error refreshing user:", error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  // Setup token refresh interval
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const setupTokenRefresh = () => {
      const refreshToken = Cookies.get("refreshToken");

      if (refreshToken) {
        intervalId = setInterval(async () => {
          try {
            const response = await authApi.refreshToken(refreshToken);
            const { accessToken, refreshToken: newRefreshToken } =
              response.data.data.tokens;
            setAuthCookies(accessToken, newRefreshToken, user?.role || "");
          } catch (error) {
            console.error("Token refresh failed:", error);
            handleLogout();
          }
        }, TOKEN_REFRESH_INTERVAL);
      }
    };

    setupTokenRefresh();
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user, handleLogout]);

  // Initial auth check
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const { tokens, user } = response.data.data;
      const { accessToken, refreshToken } = tokens;

      setAuthCookies(accessToken, refreshToken, user.role);
      setUser(user);

      toast.success("Welcome back!");
      router.push("/store");
    } catch (error) {
      console.error("Login error:", error);
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      const { tokens, user } = response.data.data;
      const { accessToken, refreshToken } = tokens;

      setAuthCookies(accessToken, refreshToken, user.role);
      setUser(user);

      toast.success("Registration successful!");
      router.push("/store");
    } catch (error) {
      console.error("Registration error:", error);
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      handleLogout();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      handleLogout(); // Still clear local state even if API call fails
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
