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
import { getKelahiranList } from "@/services/kelahiran.service";
import { formatTanggalSingkat } from "@/utils/format";

export const metadata: Metadata = {
  title: "Laporan Kelahiran",
};

export default async function KelahiranPage() {
  const laporanList = await getKelahiranList();

  return (
    <>
      <PageHeader
        title="Laporan Kelahiran"
        description="Semua catatan kelahiran ternak yang telah dilaporkan."
      >
        <Button asChild>
          <Link href="/kelahiran/baru">
            <FiPlus className="h-4 w-4" />
            Buat Laporan
          </Link>
        </Button>
      </PageHeader>

      {laporanList.length === 0 ? (
        <EmptyState
          icon={FiFileText}
          title="Belum ada laporan kelahiran"
          description="Mulai catat kelahiran ternak untuk menghitung pertumbuhan populasi."
        >
          <Button asChild>
            <Link href="/kelahiran/baru">
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
                    <TableHead>Tanggal Lahir</TableHead>
                    <TableHead>Kode Ternak</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Peternak</TableHead>
                    <TableHead>Kelamin</TableHead>
                    <TableHead>No. Akta</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {laporanList.map((laporan) => (
                    <TableRow key={laporan.id} className="group">
                      <TableCell className="whitespace-nowrap">
                        {formatTanggalSingkat(laporan.tanggalLahir)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/kelahiran/${laporan.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {laporan.ternak?.kodeTernak ?? "-"}
                        </Link>
                      </TableCell>
                      <TableCell>{laporan.ternak?.jenisTernak?.nama ?? "-"}</TableCell>
                      <TableCell>{laporan.ternak?.peternak?.nama ?? "-"}</TableCell>
                      <TableCell>
                        {laporan.ternak?.jenisKelamin === "JANTAN" ? "Jantan" : "Betina"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {laporan.nomorAkta ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/kelahiran/${laporan.id}`}
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
