import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check both cookie and authorization header
  const token =
    request.cookies.get("token") ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  const userRole = request.cookies.get("userRole");

  // Protected routes
  if (
    request.nextUrl.pathname.startsWith("/store") ||
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Seller/Admin only routes
  if (
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/seller")
  ) {
    if (
      !token ||
      (userRole?.value !== "admin" && userRole?.value !== "seller")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/store/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/seller/:path*",
  ],
};
