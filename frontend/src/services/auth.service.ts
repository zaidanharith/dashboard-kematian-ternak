import { api } from "@/lib/axios";
import { getServerApi } from "@/lib/api-server";
import type { ApiEnvelope } from "@/types/api";
import type { User } from "@/types/user";

interface AuthPayload {
  token: string;
  user: User;
}

export async function loginWithEmail(email: string, password: string): Promise<AuthPayload> {
  const { data } = await api.post<ApiEnvelope<AuthPayload>>("/auth/login", { email, password });
  return data.data;
}

export async function loginWithGoogle(idToken: string): Promise<AuthPayload> {
  const { data } = await api.post<ApiEnvelope<AuthPayload>>("/auth/google", { idToken });
  return data.data;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const client = await getServerApi();
    const { data } = await client.get<ApiEnvelope<{ user: User }>>("/users/me");
    return data.data.user;
  } catch {
    return null;
  }
}
