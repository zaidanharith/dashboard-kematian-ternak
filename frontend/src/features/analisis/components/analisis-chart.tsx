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
import type { AnalisisRankingItem } from "@/types/dashboard";

export function AnalisisChart({ ranking }: { ranking: AnalisisRankingItem[] }) {
  const data = ranking.slice(0, 8).map((item) => ({
    nama: item.nama.length > 18 ? `${item.nama.slice(0, 17)}…` : item.nama,
    jumlah: item.jumlah,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          type="category"
          dataKey="nama"
          width={120}
          tickLine={false}
          axisLine={false}
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
          formatter={(value) => [`${value} laporan`, "Jumlah"]}
        />
        <Bar dataKey="jumlah" fill="var(--chart-1)" radius={[0, 6, 6, 0]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}
