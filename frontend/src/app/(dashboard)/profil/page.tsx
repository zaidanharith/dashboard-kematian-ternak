import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { RoleBadge } from "@/components/common/role-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfilForm } from "@/features/profil/components/profil-form";
import { getCurrentUser } from "@/services/auth.service";
import { inisial } from "@/utils/format";

export const metadata: Metadata = {
  title: "Profil Saya",
};

export default async function ProfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <PageHeader title="Profil Saya" description="Kelola informasi akun Anda." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <Avatar className="h-20 w-20">
              {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
              <AvatarFallback className="bg-primary/10 text-lg text-primary">
                {inisial(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <RoleBadge role={user.role} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfilForm defaultName={user.name} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
