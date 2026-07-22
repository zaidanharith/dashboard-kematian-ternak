import { FiDownload, FiFileText } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import type { LaporanKelahiran } from "@/types/laporan";

export function AktaCard({ laporan }: { laporan: LaporanKelahiran }) {
  const nomor = laporan.nomorAkta
    ? `${laporan.nomorAkta}/AK-LH/DS-BSK/${new Date(laporan.createdAt).getFullYear()}`
    : "Belum diterbitkan";

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FiFileText className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Akta Kelahiran Ternak</p>
            <p className="font-mono text-sm font-medium tracking-tight">{nomor}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Nomor akta dikosongkan (garis bawah) di dokumen agar bisa ditulis tangan.
          Setelah ditulis, isi nomornya lewat halaman edit supaya tercatat di sistem.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="sm:w-auto">
            <a href={`/akta-kelahiran/${laporan.id}?format=docx`} download>
              <FiDownload className="h-4 w-4" />
              Unduh Word (.docx)
            </a>
          </Button>
          <Button asChild variant="outline" className="sm:w-auto">
            <a href={`/akta-kelahiran/${laporan.id}?format=pdf`} download>
              <FiDownload className="h-4 w-4" />
              Unduh PDF
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
