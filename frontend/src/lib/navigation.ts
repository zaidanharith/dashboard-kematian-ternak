import type { Role } from "@/types/user";
import {
  FiHome,
  FiFileText,
  FiUsers,
  FiDatabase,
  FiPieChart,
  FiUserCheck,
  FiTag,
  FiActivity,
} from "react-icons/fi";
import type { IconType } from "react-icons";

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
  roles: Role[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const SEMUA: Role[] = ["SUPERADMIN", "ADMIN", "PETUGAS"];
const ADMIN_KEATAS: Role[] = ["SUPERADMIN", "ADMIN"];

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Utama",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: FiHome, roles: SEMUA },
      { label: "Laporan Kematian", href: "/laporan", icon: FiFileText, roles: SEMUA },
      { label: "Analisis Penyebab", href: "/analisis", icon: FiPieChart, roles: SEMUA },
    ],
  },
  {
    label: "Data",
    items: [
      { label: "Peternak", href: "/peternak", icon: FiUsers, roles: SEMUA },
      { label: "Ternak", href: "/ternak", icon: FiDatabase, roles: SEMUA },
    ],
  },
  {
    label: "Master Data",
    items: [
      { label: "Jenis Ternak", href: "/master/jenis-ternak", icon: FiTag, roles: ADMIN_KEATAS },
      { label: "Penyebab Kematian", href: "/master/penyebab-kematian", icon: FiActivity, roles: ADMIN_KEATAS },
    ],
  },
  {
    label: "Administrasi",
    items: [
      { label: "Pengguna", href: "/pengguna", icon: FiUserCheck, roles: ["SUPERADMIN"] },
    ],
  },
];

export function navGroupsForRole(role: Role): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}

export const ROLE_LABEL: Record<Role, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Admin",
  PETUGAS: "Petugas",
};
