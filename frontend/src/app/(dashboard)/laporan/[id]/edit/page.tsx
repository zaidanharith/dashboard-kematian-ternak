import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FiArrowLeft } from "react-icons/fi";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LaporanForm } from "@/features/laporan/components/laporan-form";
import { getLaporanById } from "@/services/laporan.service";
import { getPenyebabKematianList } from "@/services/master.service";
import { toDateInputValue } from "@/utils/format";

export const metadata: Metadata = {
  title: "Edit Laporan Kematian",
};

export default async function EditLaporanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [laporan, penyebabList] = await Promise.all([
    getLaporanById(id).catch(() => null),
    getPenyebabKematianList(),
  ]);

  if (!laporan) notFound();

  const ternakLabel = `${laporan.ternak?.kodeTernak ?? "-"} — ${laporan.ternak?.jenisTernak?.nama ?? "?"} (${laporan.ternak?.peternak?.nama ?? "?"})`;

  return (
    <>
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground">
          <Link href={`/laporan/${laporan.id}`}>
            <FiArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <PageHeader title="Edit Laporan Kematian" description="Perbarui penyebab, tanggal, atau catatan." />
      </div>

      <Card className="max-w-2xl">
        <CardContent>
          <LaporanForm
            mode="edit"
            laporanId={laporan.id}
            penyebabOptions={penyebabList}
            ternakLabel={ternakLabel}
            defaultValues={{
              penyebabKematianId: laporan.penyebabKematianId,
              tanggalKematian: toDateInputValue(laporan.tanggalKematian),
              catatan: laporan.catatan ?? "",
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
