import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KelahiranForm } from "@/features/kelahiran/components/kelahiran-form";
import { getPeternakList } from "@/services/peternak.service";
import { getJenisTernakList } from "@/services/master.service";

export const metadata: Metadata = {
  title: "Buat Laporan Kelahiran",
};

export default async function BuatKelahiranPage() {
  const [peternakList, jenisList] = await Promise.all([
    getPeternakList(),
    getJenisTernakList(),
  ]);

  return (
    <>
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground">
          <Link href="/kelahiran">
            <FiArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <PageHeader
          title="Buat Laporan Kelahiran"
          description="Catat ternak yang baru lahir beserta peternak pemiliknya."
        />
      </div>

      <Card className="max-w-2xl">
        <CardContent>
          <KelahiranForm mode="create" peternakOptions={peternakList} jenisOptions={jenisList} />
        </CardContent>
      </Card>
    </>
  );
}
