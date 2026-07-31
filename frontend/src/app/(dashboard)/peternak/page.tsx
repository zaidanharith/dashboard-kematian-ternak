import Link from "next/link";
import type { Metadata } from "next";
import { FiPlus, FiUsers, FiChevronRight } from "react-icons/fi";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { SearchInput } from "@/components/common/search-input";
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
import { PeternakFormDialog } from "@/features/peternak/components/peternak-form-dialog";
import { PeternakRowActions } from "@/features/peternak/components/peternak-row-actions";
import { getPeternakList } from "@/services/peternak.service";
import { getCurrentUser } from "@/services/auth.service";
import { isAdminOrAbove } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Peternak",
};

export default async function PeternakPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const [peternakList, user] = await Promise.all([
    getPeternakList(search),
    getCurrentUser(),
  ]);
  const canManage = user ? isAdminOrAbove(user.role) : false;

  return (
    <>
      <PageHeader title="Peternak" description="Daftar peternak dan jumlah ternak yang dimiliki.">
        {canManage ? (
          <PeternakFormDialog
            trigger={
              <Button>
                <FiPlus className="h-4 w-4" />
                Tambah Peternak
              </Button>
            }
          />
        ) : null}
      </PageHeader>

      <div className="flex items-center justify-between gap-3">
        <SearchInput placeholder="Cari nama atau NIK…" />
      </div>

      {peternakList.length === 0 ? (
        <EmptyState
          icon={<FiUsers className="h-6 w-6" />}
          title={search ? "Peternak tidak ditemukan" : "Belum ada peternak"}
          description={
            search
              ? "Coba kata kunci lain."
              : "Tambahkan data peternak untuk mulai mencatat kepemilikan ternak."
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>Dusun / RT-RW</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead className="text-center">Ternak</TableHead>
                    <TableHead className="text-right">{canManage ? "Aksi" : ""}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peternakList.map((peternak) => (
                    <TableRow key={peternak.id}>
                      <TableCell>
                        <Link
                          href={`/peternak/${peternak.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {peternak.nama}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{peternak.nik}</TableCell>
                      <TableCell>
                        {peternak.dusun} · RT {peternak.rt}/{peternak.rw}
                      </TableCell>
                      <TableCell>{peternak.telepon}</TableCell>
                      <TableCell className="text-center">{peternak.ternak?.length ?? 0}</TableCell>
                      <TableCell className="text-right">
                        {canManage ? (
                          <PeternakRowActions peternak={peternak} />
                        ) : (
                          <Link
                            href={`/peternak/${peternak.id}`}
                            aria-label="Detail"
                            className="inline-flex text-muted-foreground hover:text-foreground"
                          >
                            <FiChevronRight className="h-4 w-4" />
                          </Link>
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
