"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginWithEmail, loginWithGoogle } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api-server";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/constants";

export interface AuthActionResult {
  error?: string;
}

async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function loginAction(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  try {
    const { token } = await loginWithEmail(email, password);
    await setSessionCookie(token);
    return {};
  } catch (error) {
    return { error: getApiErrorMessage(error, "Email atau password salah.") };
  }
}

export async function googleLoginAction(idToken: string): Promise<AuthActionResult> {
  try {
    const { token } = await loginWithGoogle(idToken);
    await setSessionCookie(token);
    return {};
  } catch (error) {
    return { error: getApiErrorMessage(error, "Gagal masuk dengan Google.") };
  }
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
