export type Role = "SUPERADMIN" | "ADMIN" | "PETUGAS";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
  createdAt?: string;
}
