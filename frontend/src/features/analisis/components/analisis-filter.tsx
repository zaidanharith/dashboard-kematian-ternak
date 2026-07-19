"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiFilter, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AnalisisFilterProps {
  startDate?: string;
  endDate?: string;
}

export function AnalisisFilter({ startDate, endDate }: AnalisisFilterProps) {
  const router = useRouter();
  const [start, setStart] = useState(startDate ?? "");
  const [end, setEnd] = useState(endDate ?? "");

  function apply() {
    const params = new URLSearchParams();
    if (start) params.set("startDate", start);
    if (end) params.set("endDate", end);
    const query = params.toString();
    router.push(query ? `/analisis?${query}` : "/analisis");
  }

  function reset() {
    setStart("");
    setEnd("");
    router.push("/analisis");
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-end">
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
        {(startDate || endDate) && (
          <Button variant="outline" onClick={reset} aria-label="Reset filter">
            <FiX className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
