import type { Metadata } from "next";
import { FiPieChart, FiFileText, FiActivity } from "react-icons/fi";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalisisFilter } from "@/features/analisis/components/analisis-filter";
import { AnalisisChart } from "@/features/analisis/components/analisis-chart";
import { getAnalisisPenyebab } from "@/services/dashboard.service";

export const metadata: Metadata = {
  title: "Analisis Penyebab",
};

export default async function AnalisisPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const { startDate, endDate } = await searchParams;
  const analisis = await getAnalisisPenyebab({ startDate, endDate });
  const puncak = analisis.ranking[0];

  return (
    <>
      <PageHeader
        title="Analisis Penyebab Kematian"
        description="Rekap penyebab kematian ternak paling sering terjadi."
      />

      <AnalisisFilter startDate={startDate} endDate={endDate} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Laporan" value={analisis.totalLaporan} icon={FiFileText} tone="primary" />
        <StatCard label="Ragam Penyebab" value={analisis.jumlahPenyebab} icon={FiActivity} />
        <StatCard
          label="Penyebab Teratas"
          value={puncak ? puncak.nama : "—"}
          icon={FiPieChart}
          tone="destructive"
          hint={puncak ? `${puncak.jumlah} laporan (${puncak.persentase}%)` : undefined}
        />
      </div>

      {analisis.ranking.length === 0 ? (
        <EmptyState
          icon={<FiPieChart className="h-6 w-6" />}
          title="Belum ada data untuk dianalisis"
          description="Belum ada laporan kematian pada rentang waktu yang dipilih."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Distribusi Penyebab</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalisisChart ranking={analisis.ranking} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Peringkat Penyebab Kematian</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-5">
                {analisis.ranking.map((item, index) => (
                  <li key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="font-medium">{item.nama}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.jumlah} · {item.persentase}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${item.persentase}%` }}
                      />
                    </div>
                    {item.breakdownJenisTernak.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pl-9">
                        {item.breakdownJenisTernak.map((jenis) => (
                          <Badge key={jenis.nama} variant="secondary" className="font-normal">
                            {jenis.nama}: {jenis.jumlah}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
