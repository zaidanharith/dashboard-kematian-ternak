import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FiArrowLeft, FiDatabase } from "react-icons/fi";
import { PageHeader } from "@/components/common/page-header";
import { DescriptionList } from "@/components/common/description-list";
import { EmptyState } from "@/components/common/empty-state";
import { StatusTernakBadge } from "@/components/common/status-ternak-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPeternakById } from "@/services/peternak.service";
import { formatTanggalSingkat, hitungUmur } from "@/utils/format";

export const metadata: Metadata = {
  title: "Detail Peternak",
};

export default async function DetailPeternakPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const peternak = await getPeternakById(id).catch(() => null);

  if (!peternak) notFound();

  const ternakList = peternak.ternak ?? [];

  return (
    <>
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground">
          <Link href="/peternak">
            <FiArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <PageHeader title={peternak.nama} description={`NIK ${peternak.nik}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Peternak</CardTitle>
        </CardHeader>
        <CardContent>
          <DescriptionList
            columns={3}
            items={[
              { label: "Desa", value: peternak.desa },
              { label: "Dusun", value: peternak.dusun },
              { label: "RT / RW", value: `${peternak.rt} / ${peternak.rw}` },
              { label: "Telepon", value: peternak.telepon },
              { label: "Jumlah Ternak", value: `${ternakList.length} ekor` },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ternak Dimiliki</CardTitle>
        </CardHeader>
        <CardContent className={ternakList.length === 0 ? undefined : "p-0"}>
          {ternakList.length === 0 ? (
            <EmptyState icon={<FiDatabase className="h-6 w-6" />} title="Belum ada ternak terdaftar." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Kelamin</TableHead>
                    <TableHead>Umur</TableHead>
                    <TableHead>Lahir</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ternakList.map((ternak) => (
                    <TableRow key={ternak.id}>
                      <TableCell className="font-mono text-xs">{ternak.kodeTernak}</TableCell>
                      <TableCell>{ternak.jenisTernak?.nama ?? "-"}</TableCell>
                      <TableCell>{ternak.jenisKelamin === "JANTAN" ? "Jantan" : "Betina"}</TableCell>
                      <TableCell>{hitungUmur(ternak.tanggalLahir)}</TableCell>
                      <TableCell>{formatTanggalSingkat(ternak.tanggalLahir)}</TableCell>
                      <TableCell className="text-right">
                        <StatusTernakBadge status={ternak.status} />
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
