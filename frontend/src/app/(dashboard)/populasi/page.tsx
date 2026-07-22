import type { Metadata } from "next";
import { FiMap, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PopulasiFilter } from "@/features/populasi/components/populasi-filter";
import { getAnalisisPopulasi } from "@/services/dashboard.service";
import type { LevelWilayah } from "@/types/dashboard";

export const metadata: Metadata = {
  title: "Populasi Wilayah",
};

export default async function PopulasiPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; startDate?: string; endDate?: string }>;
}) {
  const { level, startDate, endDate } = await searchParams;
  const validLevel: LevelWilayah = level === "rt" || level === "rw" ? level : "dusun";
  const analisis = await getAnalisisPopulasi({ level: validLevel, startDate, endDate });

  return (
    <>
      <PageHeader
        title="Populasi Wilayah"
        description="Populasi, angka kelahiran, dan angka kematian ternak per wilayah."
      />

      <PopulasiFilter level={validLevel} startDate={startDate} endDate={endDate} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Populasi" value={analisis.totalPopulasi} icon={FiMap} tone="primary" />
        <StatCard label="Total Lahir" value={analisis.totalLahir} icon={FiTrendingUp} tone="secondary" />
        <StatCard label="Total Mati" value={analisis.totalMati} icon={FiTrendingDown} tone="destructive" />
      </div>

      {analisis.wilayah.length === 0 ? (
        <EmptyState
          icon={FiMap}
          title="Belum ada data wilayah"
          description="Tambahkan data peternak untuk mulai menghitung populasi per wilayah."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wilayah</TableHead>
                    <TableHead className="text-right">Peternak</TableHead>
                    <TableHead className="text-right">Populasi</TableHead>
                    <TableHead className="text-right">Lahir</TableHead>
                    <TableHead className="text-right">Mati</TableHead>
                    <TableHead className="text-right">Pertumbuhan Bersih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analisis.wilayah.map((item) => (
                    <TableRow key={item.label}>
                      <TableCell className="font-medium">{item.label}</TableCell>
                      <TableCell className="text-right">{item.jumlahPeternak}</TableCell>
                      <TableCell className="text-right">{item.populasi}</TableCell>
                      <TableCell className="text-right">{item.lahir}</TableCell>
                      <TableCell className="text-right">{item.mati}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          item.pertumbuhanBersih > 0
                            ? "text-primary"
                            : item.pertumbuhanBersih < 0
                              ? "text-destructive"
                              : "text-muted-foreground"
                        }`}
                      >
                        {item.pertumbuhanBersih > 0 ? "+" : ""}
                        {item.pertumbuhanBersih}
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
