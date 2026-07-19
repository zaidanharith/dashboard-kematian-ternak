import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconType;
  hint?: string;
  tone?: "default" | "primary" | "destructive" | "secondary";
}

const TONE: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-muted text-foreground",
  primary: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
  secondary: "bg-secondary/20 text-secondary-foreground",
};

export function StatCard({ label, value, icon: Icon, hint, tone = "default" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", TONE[tone])}>
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {hint ? <p className="truncate text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
