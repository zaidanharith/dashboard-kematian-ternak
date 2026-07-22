import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FiArrowLeft } from "react-icons/fi";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KelahiranForm } from "@/features/kelahiran/components/kelahiran-form";
import { getKelahiranById } from "@/services/kelahiran.service";
import { toDateInputValue } from "@/utils/format";

export const metadata: Metadata = {
  title: "Edit Laporan Kelahiran",
};

export default async function EditKelahiranPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const laporan = await getKelahiranById(id).catch(() => null);

  if (!laporan) notFound();

  const ternakLabel = `${laporan.ternak?.kodeTernak ?? "-"} — ${laporan.ternak?.jenisTernak?.nama ?? "?"} (${laporan.ternak?.peternak?.nama ?? "?"})`;

  return (
    <>
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground">
          <Link href={`/kelahiran/${laporan.id}`}>
            <FiArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <PageHeader title="Edit Laporan Kelahiran" description="Perbarui tanggal lahir, catatan, atau nomor akta." />
      </div>

      <Card className="max-w-2xl">
        <CardContent>
          <KelahiranForm
            mode="edit"
            laporanId={laporan.id}
            ternakLabel={ternakLabel}
            defaultValues={{
              tanggalLahir: toDateInputValue(laporan.tanggalLahir),
              catatan: laporan.catatan ?? "",
              nomorAkta: laporan.nomorAkta ?? "",
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
