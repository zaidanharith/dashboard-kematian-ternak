"use client";

import Link from "next/link";
import { FiUser, FiLogOut } from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABEL } from "@/lib/navigation";
import { logoutAction } from "@/features/auth/actions";
import { inisial } from "@/utils/format";
import type { User } from "@/types/user";

export function UserMenu({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="h-9 w-9">
          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
          <AvatarFallback className="bg-primary/10 text-primary">
            {inisial(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight">{user.name}</span>
          <span className="block text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-normal">
          <span className="block text-sm font-medium">{user.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profil" className="cursor-pointer">
            <FiUser className="h-4 w-4" />
            Profil Saya
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault();
            void logoutAction();
          }}
        >
          <FiLogOut className="h-4 w-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
