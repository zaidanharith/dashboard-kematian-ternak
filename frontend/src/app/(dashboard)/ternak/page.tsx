import Link from "next/link";
import type { Metadata } from "next";
import { FiPlus, FiDatabase } from "react-icons/fi";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { StatusTernakBadge } from "@/components/common/status-ternak-badge";
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
import { cn } from "@/lib/utils";
import { TernakFormDialog } from "@/features/ternak/components/ternak-form-dialog";
import { TernakRowActions } from "@/features/ternak/components/ternak-row-actions";
import { getTernakList } from "@/services/ternak.service";
import { getPeternakList } from "@/services/peternak.service";
import { getJenisTernakList } from "@/services/master.service";
import { getCurrentUser } from "@/services/auth.service";
import { isAdminOrAbove } from "@/lib/permissions";
import { formatTanggalSingkat, hitungUmur } from "@/utils/format";
import type { StatusTernak } from "@/types/ternak";

export const metadata: Metadata = {
  title: "Ternak",
};

const FILTERS: { label: string; value?: StatusTernak }[] = [
  { label: "Semua" },
  { label: "Hidup", value: "HIDUP" },
  { label: "Mati", value: "MATI" },
];

export default async function TernakPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: StatusTernak }>;
}) {
  const { status } = await searchParams;
  const [ternakList, peternakList, jenisList, user] = await Promise.all([
    getTernakList(status ? { status } : undefined),
    getPeternakList(),
    getJenisTernakList(),
    getCurrentUser(),
  ]);
  const canManage = user ? isAdminOrAbove(user.role) : false;
  const peternakOptions = peternakList.map((p) => ({ id: p.id, nama: p.nama }));

  return (
    <>
      <PageHeader title="Ternak" description="Daftar seluruh ternak yang tercatat di desa.">
        {canManage ? (
          <TernakFormDialog
            jenisOptions={jenisList}
            peternakOptions={peternakOptions}
            trigger={
              <Button>
                <FiPlus className="h-4 w-4" />
                Tambah Ternak
              </Button>
            }
          />
        ) : null}
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = status === filter.value || (!status && !filter.value);
          return (
            <Link
              key={filter.label}
              href={filter.value ? `/ternak?status=${filter.value}` : "/ternak"}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {ternakList.length === 0 ? (
        <EmptyState
          icon={<FiDatabase className="h-6 w-6" />}
          title="Belum ada ternak"
          description="Tambahkan data ternak milik peternak untuk mulai mencatat."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Peternak</TableHead>
                    <TableHead>Kelamin</TableHead>
                    <TableHead>Umur</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">{canManage ? "Aksi" : ""}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ternakList.map((ternak) => (
                    <TableRow key={ternak.id}>
                      <TableCell className="font-mono text-xs">{ternak.kodeTernak}</TableCell>
                      <TableCell>{ternak.jenisTernak?.nama ?? "-"}</TableCell>
                      <TableCell>{ternak.peternak?.nama ?? "-"}</TableCell>
                      <TableCell>{ternak.jenisKelamin === "JANTAN" ? "Jantan" : "Betina"}</TableCell>
                      <TableCell>{hitungUmur(ternak.tanggalLahir)}</TableCell>
                      <TableCell>
                        <StatusTernakBadge status={ternak.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {canManage ? (
                          <TernakRowActions
                            ternak={ternak}
                            jenisOptions={jenisList}
                            peternakOptions={peternakOptions}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {formatTanggalSingkat(ternak.tanggalLahir)}
                          </span>
                        )}
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
