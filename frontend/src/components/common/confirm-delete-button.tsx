"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/types/action";

interface ConfirmDeleteButtonProps {
  action: () => Promise<ActionResult>;
  title?: string;
  description: string;
  triggerLabel?: string;
  iconOnly?: boolean;
  redirectTo?: string;
}

export function ConfirmDeleteButton({
  action,
  title = "Hapus data ini?",
  description,
  triggerLabel = "Hapus",
  iconOnly = false,
  redirectTo,
}: ConfirmDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Data berhasil dihapus.");
      setOpen(false);
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="destructive"
        size={iconOnly ? "icon-sm" : "sm"}
        onClick={() => setOpen(true)}
        aria-label={iconOnly ? triggerLabel : undefined}
      >
        <FiTrash2 className="h-4 w-4" />
        {iconOnly ? null : triggerLabel}
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleConfirm();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Menghapus…" : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
