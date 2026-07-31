import type { Role } from "@/types/user";

export function isAdminOrAbove(role: Role): boolean {
  return role === "SUPERADMIN" || role === "ADMIN";
}

export function canManageUsers(role: Role): boolean {
  return role === "SUPERADMIN";
}
