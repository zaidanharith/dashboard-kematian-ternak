import "server-only";
import axios, { type AxiosInstance } from "axios";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";

export async function getServerApi(): Promise<AxiosInstance> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}
