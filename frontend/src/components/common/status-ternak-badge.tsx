import { cn } from "@/lib/utils";
import type { StatusTernak } from "@/types/ternak";

export function StatusTernakBadge({ status }: { status: StatusTernak }) {
  const mati = status === "MATI";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        mati
          ? "bg-destructive/10 text-destructive"
          : "bg-primary/10 text-primary",
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", mati ? "bg-destructive" : "bg-primary")}
      />
      {mati ? "Mati" : "Hidup"}
    </span>
  );
}
