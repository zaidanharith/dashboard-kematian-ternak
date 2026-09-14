import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/constants";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_for_development",
);

async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/login";
  const authenticated = await isValidSession(token);

  if (!authenticated && !isLoginRoute) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (token) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (authenticated && isLoginRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
