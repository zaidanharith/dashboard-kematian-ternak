import type { Role } from "@/types/user";

export function canManageData(role: Role): boolean {
  return role === "SUPERADMIN" || role === "ADMIN";
}

export function canDeleteLaporan(role: Role): boolean {
  return role === "SUPERADMIN" || role === "ADMIN";
}

export function canManageMasterData(role: Role): boolean {
  return role === "SUPERADMIN" || role === "ADMIN";
}

export function canManageUsers(role: Role): boolean {
  return role === "SUPERADMIN";
}
