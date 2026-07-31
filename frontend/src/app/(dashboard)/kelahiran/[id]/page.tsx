import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FiArrowLeft, FiEdit2 } from "react-icons/fi";
import { PageHeader } from "@/components/common/page-header";
import { DescriptionList } from "@/components/common/description-list";
import { ConfirmDeleteButton } from "@/components/common/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AktaCard } from "@/features/kelahiran/components/akta-card";
import { deleteKelahiranAction } from "@/features/kelahiran/actions";
import { getKelahiranById } from "@/services/kelahiran.service";
import { getCurrentUser } from "@/services/auth.service";
import { isAdminOrAbove } from "@/lib/permissions";
import { formatTanggal } from "@/utils/format";

export const metadata: Metadata = {
  title: "Detail Laporan Kelahiran",
};

export default async function DetailKelahiranPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [laporan, user] = await Promise.all([
    getKelahiranById(id).catch(() => null),
    getCurrentUser(),
  ]);

  if (!laporan) notFound();

  const ternak = laporan.ternak;
  const peternak = ternak?.peternak;

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
          title={`Laporan — ${ternak?.kodeTernak ?? ""}`}
          description={`Dicatat oleh ${laporan.petugas?.name ?? "-"}`}
        >
          <Button asChild variant="outline">
            <Link href={`/kelahiran/${laporan.id}/edit`}>
              <FiEdit2 className="h-4 w-4" />
              Edit
            </Link>
          </Button>
          {user && isAdminOrAbove(user.role) ? (
            <ConfirmDeleteButton
              action={deleteKelahiranAction.bind(null, laporan.id)}
              title="Hapus laporan kelahiran?"
              description="Laporan dan data ternak yang tercatat lewat laporan ini akan dihapus. Tindakan ini tidak dapat dibatalkan."
              redirectTo="/kelahiran"
            />
          ) : null}
        </PageHeader>
      </div>

      <AktaCard laporan={laporan} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detail Kelahiran</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList
              items={[
                { label: "Tanggal Lahir", value: formatTanggal(laporan.tanggalLahir) },
                { label: "Petugas", value: laporan.petugas?.name ?? "-" },
                { label: "Catatan", value: laporan.catatan || "-" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Ternak & Peternak</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList
              items={[
                { label: "Kode Ternak", value: ternak?.kodeTernak ?? "-" },
                { label: "Jenis Ternak", value: ternak?.jenisTernak?.nama ?? "-" },
                { label: "Jenis Kelamin", value: ternak?.jenisKelamin === "JANTAN" ? "Jantan" : "Betina" },
                { label: "Ras/Rumpun", value: ternak?.rasRumpun || "-" },
                { label: "Peternak", value: peternak?.nama ?? "-" },
                { label: "Dusun", value: peternak ? `${peternak.dusun} RT ${peternak.rt}/${peternak.rw}` : "-" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
