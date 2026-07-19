import { FiDownload, FiFileText } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import type { LaporanKematian } from "@/types/laporan";

export function BeritaAcaraCard({ laporan }: { laporan: LaporanKematian }) {
  const nomor = laporan.nomorBeritaAcara
    ? `${laporan.nomorBeritaAcara}/BA-KT/DS-BSK/${new Date(laporan.createdAt).getFullYear()}`
    : "Belum diterbitkan";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border-4 border-primary/10"
      />
      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FiFileText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Berita Acara Kematian Ternak</p>
              <p className="font-mono text-sm font-medium tracking-tight">{nomor}</p>
            </div>
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Dokumen Resmi
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          Unduh dokumen berita acara yang terisi otomatis dari data laporan ini. Nomor berita acara
          diterbitkan saat dokumen pertama kali diunduh.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="sm:w-auto">
            <a href={`/berita-acara/${laporan.id}?format=docx`} download>
              <FiDownload className="h-4 w-4" />
              Unduh Word (.docx)
            </a>
          </Button>
          <Button asChild variant="outline" className="sm:w-auto">
            <a href={`/berita-acara/${laporan.id}?format=pdf`} download>
              <FiDownload className="h-4 w-4" />
              Unduh PDF
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
