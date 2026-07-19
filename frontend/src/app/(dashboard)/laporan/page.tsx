import Link from "next/link";
import type { Metadata } from "next";
import { FiPlus, FiFileText, FiChevronRight } from "react-icons/fi";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLaporanList } from "@/services/laporan.service";
import { formatTanggalSingkat } from "@/utils/format";

export const metadata: Metadata = {
  title: "Laporan Kematian",
};

export default async function LaporanPage() {
  const laporanList = await getLaporanList();

  return (
    <>
      <PageHeader
        title="Laporan Kematian"
        description="Semua catatan kematian ternak yang telah dilaporkan."
      >
        <Button asChild>
          <Link href="/laporan/baru">
            <FiPlus className="h-4 w-4" />
            Buat Laporan
          </Link>
        </Button>
      </PageHeader>

      {laporanList.length === 0 ? (
        <EmptyState
          icon={FiFileText}
          title="Belum ada laporan kematian"
          description="Mulai catat kematian ternak untuk menghasilkan berita acara otomatis."
        >
          <Button asChild>
            <Link href="/laporan/baru">
              <FiPlus className="h-4 w-4" />
              Buat Laporan
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kode Ternak</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Peternak</TableHead>
                    <TableHead>Penyebab</TableHead>
                    <TableHead>No. Berita Acara</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {laporanList.map((laporan) => (
                    <TableRow key={laporan.id} className="group">
                      <TableCell className="whitespace-nowrap">
                        {formatTanggalSingkat(laporan.tanggalKematian)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/laporan/${laporan.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {laporan.ternak?.kodeTernak ?? "-"}
                        </Link>
                      </TableCell>
                      <TableCell>{laporan.ternak?.jenisTernak?.nama ?? "-"}</TableCell>
                      <TableCell>{laporan.ternak?.peternak?.nama ?? "-"}</TableCell>
                      <TableCell>{laporan.penyebabKematian?.nama ?? "-"}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {laporan.nomorBeritaAcara ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/laporan/${laporan.id}`}
                          aria-label="Lihat detail"
                          className="text-muted-foreground transition-colors group-hover:text-foreground"
                        >
                          <FiChevronRight className="h-4 w-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
