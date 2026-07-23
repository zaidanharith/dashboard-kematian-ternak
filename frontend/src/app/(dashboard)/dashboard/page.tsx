import Link from "next/link";
import type { Metadata } from "next";
import {
  FiFileText,
  FiUsers,
  FiPlus,
  FiActivity,
  FiHeart,
  FiUserPlus,
} from "react-icons/fi";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { EmptyState } from "@/components/common/empty-state";
import { StatusTernakBadge } from "@/components/common/status-ternak-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrenChart } from "@/features/dashboard/components/tren-chart";
import { getDashboardSummary } from "@/services/dashboard.service";
import { formatTanggalSingkat } from "@/utils/format";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const maksPenyebab = summary.penyebabDominan[0]?.jumlah ?? 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Ringkasan populasi, kelahiran, dan kematian ternak Desa Besuki."
      >
        <Button asChild variant="outline">
          <Link href="/kelahiran/baru">
            <FiPlus className="h-4 w-4" />
            Catat Kelahiran
          </Link>
        </Button>
        <Button asChild>
          <Link href="/laporan/baru">
            <FiPlus className="h-4 w-4" />
            Catat Kematian
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Populasi Ternak"
          value={summary.ternakHidup}
          icon={FiHeart}
          tone="secondary"
        />
        <StatCard
          label="Peternak Terdaftar"
          value={summary.totalPeternak}
          icon={FiUsers}
        />
        <StatCard
          label="Kelahiran Tahun Ini"
          value={summary.laporanKelahiranTahunIni}
          icon={FiUserPlus}
          tone="primary"
          hint={`${summary.laporanKelahiranBulanIni} laporan bulan ini`}
        />
        <StatCard
          label="Kematian Tahun Ini"
          value={summary.laporanTahunIni}
          icon={FiFileText}
          tone="destructive"
          hint={`${summary.laporanBulanIni} laporan bulan ini`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tren Populasi 12 Bulan Terakhir</CardTitle>
            <CardDescription>Jumlah kelahiran vs kematian ternak per bulan.</CardDescription>
          </CardHeader>
          <CardContent>
            <TrenChart data={summary.trenPopulasi} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Penyebab Dominan</CardTitle>
            <CardDescription>Penyebab kematian paling sering.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.penyebabDominan.length === 0 ? (
              <EmptyState icon={<FiActivity className="h-6 w-6" />} title="Belum ada data penyebab." />
            ) : (
              <ul className="space-y-4">
                {summary.penyebabDominan.map((penyebab) => (
                  <li key={penyebab.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{penyebab.nama}</span>
                      <span className="text-muted-foreground">{penyebab.jumlah}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${maksPenyebab ? (penyebab.jumlah / maksPenyebab) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Laporan Terbaru</CardTitle>
            <CardDescription>5 laporan kematian terakhir.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/laporan">Lihat semua</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {summary.laporanTerbaru.length === 0 ? (
            <EmptyState
              icon={<FiFileText className="h-6 w-6" />}
              title="Belum ada laporan kematian."
              description="Laporan yang Anda buat akan muncul di sini."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Ternak</TableHead>
                    <TableHead>Peternak</TableHead>
                    <TableHead>Penyebab</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.laporanTerbaru.map((laporan) => (
                    <TableRow key={laporan.id}>
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
                        <span className="block text-xs text-muted-foreground">
                          {laporan.ternak?.jenisTernak?.nama ?? "-"}
                        </span>
                      </TableCell>
                      <TableCell>{laporan.ternak?.peternak?.nama ?? "-"}</TableCell>
                      <TableCell>{laporan.penyebabKematian?.nama ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        <StatusTernakBadge status="MATI" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
