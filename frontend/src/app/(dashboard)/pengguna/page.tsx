import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { FiUserCheck } from "react-icons/fi";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { RoleBadge } from "@/components/common/role-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RegisterUserDialog } from "@/features/pengguna/components/register-user-dialog";
import { getUsers } from "@/services/user.service";
import { getCurrentUser } from "@/services/auth.service";
import { canManageUsers } from "@/lib/permissions";
import { formatTanggalSingkat, inisial } from "@/utils/format";

export const metadata: Metadata = {
  title: "Pengguna",
};

export default async function PenggunaPage() {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user.role)) {
    redirect("/dashboard");
  }

  const users = await getUsers();

  return (
    <>
      <PageHeader title="Pengguna" description="Kelola akun Admin dan Petugas.">
        <RegisterUserDialog />
      </PageHeader>

      {users.length === 0 ? (
        <EmptyState icon={FiUserCheck} title="Belum ada akun terdaftar" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Terdaftar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {item.avatarUrl ? (
                              <AvatarImage src={item.avatarUrl} alt={item.name} />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-xs text-primary">
                              {inisial(item.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={item.role} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.createdAt ? formatTanggalSingkat(item.createdAt) : "-"}
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
