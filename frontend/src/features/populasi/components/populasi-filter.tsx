"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiFilter, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LevelWilayah } from "@/types/dashboard";

interface PopulasiFilterProps {
  level: LevelWilayah;
  startDate?: string;
  endDate?: string;
}

const LEVEL_LABEL: Record<LevelWilayah, string> = {
  dusun: "Dusun",
  rt: "Dusun + RT",
  rw: "Dusun + RT + RW",
};

export function PopulasiFilter({ level, startDate, endDate }: PopulasiFilterProps) {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<LevelWilayah>(level);
  const [start, setStart] = useState(startDate ?? "");
  const [end, setEnd] = useState(endDate ?? "");

  function apply() {
    const params = new URLSearchParams();
    if (selectedLevel !== "dusun") params.set("level", selectedLevel);
    if (start) params.set("startDate", start);
    if (end) params.set("endDate", end);
    const query = params.toString();
    router.push(query ? `/populasi?${query}` : "/populasi");
  }

  function reset() {
    setSelectedLevel("dusun");
    setStart("");
    setEnd("");
    router.push("/populasi");
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-end sm:flex-wrap">
      <div className="grid gap-1.5">
        <Label htmlFor="level">Kelompokkan per</Label>
        <Select value={selectedLevel} onValueChange={(value) => setSelectedLevel(value as LevelWilayah)}>
          <SelectTrigger id="level" className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(LEVEL_LABEL) as LevelWilayah[]).map((item) => (
              <SelectItem key={item} value={item}>
                {LEVEL_LABEL[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid flex-1 gap-1.5">
        <Label htmlFor="startDate">Dari tanggal</Label>
        <Input
          id="startDate"
          type="date"
          value={start}
          onChange={(event) => setStart(event.target.value)}
        />
      </div>
      <div className="grid flex-1 gap-1.5">
        <Label htmlFor="endDate">Sampai tanggal</Label>
        <Input
          id="endDate"
          type="date"
          value={end}
          onChange={(event) => setEnd(event.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={apply}>
          <FiFilter className="h-4 w-4" />
          Terapkan
        </Button>
        {(level !== "dusun" || startDate || endDate) && (
          <Button variant="outline" onClick={reset} aria-label="Reset filter">
            <FiX className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
