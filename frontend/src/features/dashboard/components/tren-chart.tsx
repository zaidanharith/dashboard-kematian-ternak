"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrenPoint } from "@/types/dashboard";

export function TrenChart({ data }: { data: TrenPoint[] }) {
  const compact = data.map((point) => ({
    ...point,
    short: point.label.replace(/ \d{4}$/, ""),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={compact} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="short"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={32}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={{
            borderRadius: "0.75rem",
            border: "1px solid var(--border)",
            background: "var(--popover)",
            color: "var(--popover-foreground)",
            fontSize: "0.8rem",
          }}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ""}
          formatter={(value) => [`${value} laporan`, "Kematian"]}
        />
        <Bar dataKey="jumlah" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
