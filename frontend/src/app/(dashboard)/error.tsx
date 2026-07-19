"use client";

import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <FiAlertTriangle className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <p className="font-medium">Gagal memuat data</p>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          Terjadi kesalahan saat mengambil data dari server. Pastikan koneksi ke backend aktif,
          lalu coba lagi.
        </p>
      </div>
      <Button onClick={reset} variant="outline">
        Coba lagi
      </Button>
    </div>
  );
}
