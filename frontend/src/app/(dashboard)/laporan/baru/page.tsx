import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LaporanForm } from "@/features/laporan/components/laporan-form";
import { getTernakList } from "@/services/ternak.service";
import { getPenyebabKematianList } from "@/services/master.service";

export const metadata: Metadata = {
  title: "Buat Laporan Kematian",
};

export default async function BuatLaporanPage() {
  const [ternakHidup, penyebabList] = await Promise.all([
    getTernakList({ status: "HIDUP" }),
    getPenyebabKematianList(),
  ]);

  const ternakOptions = ternakHidup.map((ternak) => ({
    id: ternak.id,
    label: `${ternak.kodeTernak} — ${ternak.jenisTernak?.nama ?? "?"} (${ternak.peternak?.nama ?? "?"})`,
  }));

  return (
    <>
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground">
          <Link href="/laporan">
            <FiArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <PageHeader
          title="Buat Laporan Kematian"
          description="Catat ternak yang mati beserta penyebabnya."
        />
      </div>

      <Card className="max-w-2xl">
        <CardContent>
          <LaporanForm mode="create" ternakOptions={ternakOptions} penyebabOptions={penyebabList} />
        </CardContent>
      </Card>
    </>
  );
}
