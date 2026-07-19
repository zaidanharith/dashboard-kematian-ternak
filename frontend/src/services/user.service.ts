import { getServerApi } from "@/lib/api-server";
import type { ApiEnvelope } from "@/types/api";
import type { Role, User } from "@/types/user";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role: Extract<Role, "ADMIN" | "PETUGAS">;
}

export async function getUsers(): Promise<User[]> {
  const client = await getServerApi();
  const { data } = await client.get<ApiEnvelope<{ users: User[] }>>("/users");
  return data.data.users;
}

export async function registerUser(input: RegisterUserInput): Promise<User> {
  const client = await getServerApi();
  const { data } = await client.post<ApiEnvelope<{ user: User }>>("/users", input);
  return data.data.user;
}

export async function updateMe(name: string): Promise<User> {
  const client = await getServerApi();
  const { data } = await client.patch<ApiEnvelope<{ user: User }>>("/users/me", { name });
  return data.data.user;
}
