import { cn } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/navigation";
import type { Role } from "@/types/user";

const TONE: Record<Role, string> = {
  SUPERADMIN: "bg-primary/10 text-primary",
  ADMIN: "bg-secondary/25 text-secondary-foreground",
  PETUGAS: "bg-muted text-muted-foreground",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE[role],
      )}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}
