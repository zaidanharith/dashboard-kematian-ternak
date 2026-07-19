"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiMenu } from "react-icons/fi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import type { User } from "@/types/user";

function Brand({ subtle }: { subtle?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 px-2">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white p-1 shadow-sm">
        <Image
          src="/logo-bumdes.png"
          alt="Logo BUMDes Sumber Abadi"
          width={40}
          height={40}
          className="h-full w-full object-contain"
        />
      </span>
      <span className="leading-tight">
        <span className="block font-semibold">Dashboard Ternak</span>
        <span className={subtle ? "block text-xs text-sidebar-foreground/60" : "block text-xs text-muted-foreground"}>
          BUMDes Sumber Abadi
        </span>
      </span>
    </Link>
  );
}

export function DashboardShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 border-r border-sidebar-border bg-sidebar py-6 text-sidebar-foreground lg:flex">
        <div className="px-3">
          <Brand subtle />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarNav role={user.role} />
        </div>
        <div className="px-5">
          <p className="text-xs leading-relaxed text-sidebar-foreground/50">
            BUMDes Sumber Abadi
            <br />
            Desa Besuki
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Buka menu">
                <FiMenu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
              <SheetHeader className="border-b border-sidebar-border px-3 py-4 text-left">
                <SheetTitle className="text-sidebar-foreground">
                  <Brand subtle />
                </SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto py-4">
                <SidebarNav role={user.role} onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="lg:hidden">
            <span className="text-sm font-semibold">Dashboard Ternak</span>
          </div>

          <div className="ml-auto">
            <UserMenu user={user} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
